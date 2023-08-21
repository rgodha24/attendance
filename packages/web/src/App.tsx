import { useEffect } from "react";
import { tokenAtom } from "./token";
import { useAtom } from "jotai";

function App() {
  const [token, setToken] = useAtom(tokenAtom);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const newToken = params.get("token");
    if (newToken) {
      setToken(newToken);
      window.location.replace(window.location.origin);
    }
  }, []);

  return (
    <>
      {!token ? (
        <a
          href={`${import.meta.env.VITE_API_URL}/auth/google/authorize`}
          rel="noreferrer"
        >
          sign in w google
        </a>
      ) : (
        <>
          <div>logged in</div>
          <button onClick={() => setToken(undefined)}>logout</button>
        </>
      )}
    </>
  );
}

export default App;
