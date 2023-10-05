import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/API";
import { ConfigStack } from "./stacks/Config";
import { SitesStack } from "./stacks/Sites";
import { DBStack } from "./stacks/DB";
import { WSStack } from "./stacks/WS";

export default {
  config(_input) {
    return {
      name: "attendance",
      region: "us-west-1",
    };
  },
  stacks(app) {
    app
      .stack(DBStack)
      .stack(ApiStack)
      .stack(WSStack)
      .stack(SitesStack)
      .stack(ConfigStack);
  },
} satisfies SSTConfig;
