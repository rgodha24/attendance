import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { ConnectionEntity } from "@attendance/core/db/schema";
import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";

export const connect = ApiHandler(async (e) => {
  // need ApiHandler for auth, but there are no types for it
  const event = e as unknown as APIGatewayProxyEvent;
  const session = useSession();
  if (session.type === "public") return { statusCode: 401 };
  const connectionID = event.requestContext.connectionId;
  if (!connectionID) return { statusCode: 400 };

  await ConnectionEntity.create({
    userID: session.properties.userID,
    connectionID,
  }).go();

  return { statusCode: 200, body: "Connected" };
});

export const disconnect = ApiHandler(async (e) => {
  // need ApiHandler for auth, but there are no types for it
  const event = e as unknown as APIGatewayProxyEvent;
  const connectionID = event.requestContext.connectionId;
  if (!connectionID) return { statusCode: 400 };
  const session = useSession();

  if (session.type === "public") {
    const conn = await ConnectionEntity.query.id({ connectionID }).go();

    if (conn.data.length === 0) return { statusCode: 404 };

    await ConnectionEntity.delete(conn.data[0]).go();
    return { statusCode: 200, body: "Disconnected" };
  } else {
    await ConnectionEntity.delete({ userID: session.properties.userID, connectionID }).go()
  }
});
