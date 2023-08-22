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
    throw redirect({
      to: "/login",
      search: {
        redirect: router.state.location.href,
      },
    });
  }

  console.log("after");
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
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const App = () => <RouterProvider router={router} />;
