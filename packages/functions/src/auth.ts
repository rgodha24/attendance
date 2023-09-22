import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";
import { Config } from "sst/node/config";
import { User } from "@attendance/core/db/user";
import { createUID } from "@attendance/core/uid";

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

        let user = await User.getGoogleID({ googleID: sub });
        if (!user) {
          console.log("creating user");
          user = await User.create({
            googleID: sub,
            userID: createUID(),
            email,
            connectedScanners: [""],
          });
        } else {
          console.log("using alr made user w/ email", email, user);
        }

        return Session.parameter({
          type: "user",
          redirect: Config.frontendURL,
          properties: {
            userID: user.userID,
            googleID: user.googleID,
          },
        });
      },
    }),
  },
});

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: number;
      googleID: string;
    };
  }
}
