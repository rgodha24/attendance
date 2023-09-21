import { useEffect } from "react";
import SuperJSON from "superjson";
import { messageSchema } from "@attendance/core/message/schema";
import { addSignIn } from "./idb";

export function useWsConnection() {
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token") || '""') as string;
    if (token?.length === 0) window.location.pathname = "/login";

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onopen = () => ws.send(JSON.stringify({ action: "auth", data: token }));

    ws.onmessage = async (event) => {
      console.log(event.data);
      const data = SuperJSON.parse(event.data);
      const message = messageSchema.safeParse(data);
      if (!message.success) return;
      const { data: m } = message;

      if (m.type === "signin") {
        try {
          await addSignIn(m);
        } catch (e) {
          console.log("error adding sigin", e);
        }
      } else if (m.type === "scannerConnected") {
        window.dispatchEvent(new CustomEvent("scanner"));
      } else if (m.type === "scannerDisconnected") {
        window.dispatchEvent(new CustomEvent("scanner"));
      }
    };

    return () => {
      console.log("disconnecting ws :((");
      ws.close();
    };
  }, []);
}
