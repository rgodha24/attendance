import { AuthHandler, GoogleAdapter, Session } from "sst/node/auth";
import { Config } from "sst/node/config";

export const handler = AuthHandler({
  providers: {
    google: GoogleAdapter({
      mode: "oidc",
      clientID:
        "848157062371-j17i2ncj341im5au9tfph0pgeua2s7pv.apps.googleusercontent.com",
      onSuccess: async (tokenset) => {
        const claims = tokenset.claims();

        console.log(process.env.FRONTEND_URL);

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
