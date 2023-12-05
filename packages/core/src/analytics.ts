import { Config } from "sst/node/config";
import { PostHog } from "posthog-node";

const client = new PostHog(Config.POSTHOG_API_KEY, {
  host: "https://app.posthog.com",
});

export const signin = async ({
  scannerName,
  id,
}: {
  scannerName: string;
  id: string;
}) => {
  client.capture({
    distinctId: id,
    event: "signin",
    properties: {
      scannerName,
      stage: Config.STAGE,
    },
  });

  await client.flushAsync();
};
