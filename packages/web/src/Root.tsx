import { useState } from "react";
import { tokenAtom } from "./token";
import { useAtom } from "jotai";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import { Outlet } from "@tanstack/react-router";

const API = import.meta.env.VITE_API_URL;

export function Root() {
  const [queryClient] = useState(() => new QueryClient());

  const [token, setToken] = useAtom(tokenAtom);

  const [trpcClient] = useState(() => {
    const token = localStorage.getItem("token");
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API}/trpc`,
          headers() {
            return !!token
              ? {
                Authorization: `Bearer ${JSON.parse(token)}`,
              }
              : {};
          },
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {!token ? (
          <a href={`${API}/auth/google/authorize`}>sign in w google</a>
        ) : (
          <button onClick={() => setToken(undefined)}>log out</button>
        )}
        {token}
        <Outlet />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
