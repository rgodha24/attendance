import {
  RouterProvider,
  Router,
  Route,
  RootRoute,
  redirect,
} from "@tanstack/react-router";
import { Root } from "./Root";
import { Home } from "./routes/home";
import { Login } from "./routes/login";
import { createStore } from "jotai";
import { tokenAtom } from "./token";
import { AddClass } from "./routes/addClass";

const ensureLoggedIn = () => {
  const token = localStorage.getItem("token");
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const newToken = params.get("token");

  // if we just logged in, just keep going.
  if (newToken) {
    const store = createStore();
    store.set(tokenAtom, newToken);

    const redirectTo = params.get("redirect");
    if (redirectTo) router.history.push(redirectTo);
    window.location.replace(window.location.origin);
    return;
  }

  const isLoggedIn =
    token !== null && token.length > 0 && token !== "undefined";

  if (!isLoggedIn) {
    console.log("not logged in");
    localStorage.setItem("token", "");
    throw redirect({
      to: "/login",
      search: {
        redirect: router.state.location.href,
      },
    });
  }

  const parsedToken = JSON.parse(atob(token.split(".")[1]));
  const isExpired = Math.floor(new Date().getTime() / 1000) > parsedToken.iat;
  if (isExpired) {
    console.log("expired");
    localStorage.setItem("token", "");
    throw redirect({
      to: "/login",
    });
  }
};

const rootRoute = new RootRoute({
  component: Root,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
  beforeLoad: ensureLoggedIn,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
  beforeLoad: () => {
    const token = localStorage.getItem("token");
    if (token?.length !== 0) router.history.push("/");
  },
});

const addClassRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/addClass",
  component: AddClass,
  beforeLoad: ensureLoggedIn,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  addClassRoute,
]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App = () => <RouterProvider router={router} />;
