import { tokenAtom } from "@/token";
import { useAtom } from "jotai";
import { useEffect } from "react";
import SuperJSON from "superjson";
import { messageSchema } from "@attendance/core/message/schema";
import { addSignin } from "./duckdb";

export function useWsConnection() {
  const [token] = useAtom(tokenAtom);
  useEffect(() => {
    // if (!token || token?.length === 0) window.location.pathname = "/login";

    console.log("here!!");

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    ws.onopen = () => ws.send(JSON.stringify({ action: "auth", data: token }));

    ws.onmessage = (event) => {
      console.log(event.data);
      const data = SuperJSON.parse(event.data);
      const message = messageSchema.safeParse(data);
      if (!message.success) return;
      const { data: m } = message;

      if (m.type === "signin") {
        addSignin({
          id: m.id,
          date: m.time,
          scanner_name: m.scannerName,
          studentID: m.studentID,
        });
      } else if (m.type === "scannerConnected") {
      } else if (m.type === "scannerDisconnected") {
      }
    };

    return () => ws.close();
  }, []);
}
