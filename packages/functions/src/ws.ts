import type { APIGatewayProxyEvent } from "aws-lambda";
import { createVerifier } from "fast-jwt";
import {
  ConnectionEntity,
  UnauthedConnectionEntity,
} from "@attendance/core/db/schema";
import { z } from "zod";
import { SessionValue, getPublicKey } from "sst/node/auth";
import { WebSocketApiHandler } from "sst/node/websocket-api";

export const connect = async (event: APIGatewayProxyEvent) => {
  const connectionID = event.requestContext.connectionId;
  if (!connectionID) return { statusCode: 400 };

  const con = await UnauthedConnectionEntity.create({
    connectionID,
    connectionDate: Date.now(),
  }).go();

  const { stage, domainName } = event.requestContext;
  console.log(`${domainName}/${stage}`);

  console.log(con);
};

export const auth = WebSocketApiHandler(async (event) => {
  const schema = z.object({
    data: z.string(),
    action: z.literal("auth"),
  });
  const connectionID = event.requestContext.connectionId;
  if (!connectionID) return { statusCode: 400 };

  const data = schema.safeParse(JSON.parse(event.body ?? "{}"));
  if (!data.success) {
    console.log("body is wrong", data.error);

    return deleteConnection(event.requestContext.connectionId);
  }

  const { data: con } = await UnauthedConnectionEntity.query
    .connections({ connectionID })
    .go();

  await Promise.all(con.map((c) => UnauthedConnectionEntity.delete(c).go()));

  const jwt = createVerifier({
    algorithms: ["RS512"],
    key: getPublicKey(),
  })(data.data.data) as SessionValue;

  if (jwt.type !== "user") return deleteConnection(connectionID);

  await ConnectionEntity.create({
    connectionID,
    userID: jwt.properties.userID,
  }).go();

  return {
    statusCode: 200,
    body: "authed",
  };
});

export const disconnect = async (event: APIGatewayProxyEvent) => {
  const connectionID = event.requestContext.connectionId;
  if (!connectionID) return { statusCode: 400 };

  console.log("disconnecting", connectionID);

  const { data: authedConns } = await ConnectionEntity.query
    .id({ connectionID })
    .go();

  const { data: unauthedConns } = await UnauthedConnectionEntity.query
    .id({ connectionID })
    .go();

  await Promise.all([
    ...authedConns.map((c) => ConnectionEntity.delete(c).go()),
    ...unauthedConns.map((c) => UnauthedConnectionEntity.delete(c).go()),
  ]);

  return { statusCode: 200, body: "Disconnected" };
};

import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { Config } from "sst/node/config";

async function deleteConnection(connectionID: string) {
  const wsURL = Config.wsURL.replace("wss://", "https://");
  const manager = new ApiGatewayManagementApi({ endpoint: wsURL });

  await manager.deleteConnection({ ConnectionId: connectionID });

  return {
    statusCode: 401,
  };
}
