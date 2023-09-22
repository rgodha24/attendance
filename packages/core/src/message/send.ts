import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { ConnectionEntity } from "../db/schema";
import { Config } from "sst/node/config";
import superjson from "superjson";
import { Message } from "./schema";

export async function sendMessage(userID: number, message: Message) {
  const wsURL = Config.wsURL.replace("wss://", "https://");
  const manager = new ApiGatewayManagementApi({ endpoint: wsURL });

  const connections = (
    await ConnectionEntity.query.connections({ userID }).go()
  ).data.map(({ connectionID }) => connectionID);

  const postToConnection = async (ConnectionId: string) => {
    try {
      await manager.postToConnection({
        ConnectionId,
        Data: superjson.stringify(message),
      });
    } catch (e) {
      // we love ts errors being unknown
      if (
        e !== null &&
        typeof e === "object" &&
        "statusCode" in e &&
        e.statusCode === 410
      ) {
        await ConnectionEntity.delete({
          userID,
          connectionID: ConnectionId,
        }).go();
      }

      console.error("failed to post to uid", userID, "conn", ConnectionId);
    }
  };

  await Promise.all(connections.map(postToConnection));
}
