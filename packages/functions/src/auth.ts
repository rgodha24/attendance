import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";
import { Config } from "sst/node/config";
import { User } from "@attendance/core/db/user";

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID:
        "848157062371-j17i2ncj341im5au9tfph0pgeua2s7pv.apps.googleusercontent.com",
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims();
        const { sub, email = "" } = claims;

        console.log("here!!!");

        const user = await User.get({ userID: sub });
        if (!user) {
          console.log("creating user");
          await User.create({ userID: sub, email, connectedScanners: [""] });
        } else {
          console.log("using alr made user w/ email", email, user);
        }

        return Session.parameter({
          type: "user",
          redirect: Config.frontendURL,
          properties: {
            userID: claims.sub,
          },
        });
      },
    }),
  },
});

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}
