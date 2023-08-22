import { StackContext, Api, StaticSite, Auth } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

export function MyStack({ stack }: StackContext) {
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        environment: {
          FRONTEND_URL:
            stack.stage === "prod"
              ? "https://d3srpthy1layee.cloudfront.net"
              : "http://localhost:5173",
        },
      },
      // authorizer: "none",
    },
    routes: {
      "GET /trpc/{proxy+}": "packages/functions/src/trpc.handler",
    },
    customDomain:
      stack.stage === "prod"
        ? {
          domainName: "api.batt.rgodha.com",
          isExternalDomain: true,
          cdk: {
            certificate: Certificate.fromCertificateArn(
              stack,
              "api-cert",
              "arn:aws:acm:us-west-1:634758516618:certificate/0f0d7c72-4ca8-4461-82d5-13794c168302"
            ),
          },
        }
        : undefined,
  });

  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  const site = new StaticSite(stack, "site", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
    },
    customDomain:
      stack.stage === "prod"
        ? {
          domainName: "fe.batt.rgodha.com",
          isExternalDomain: true,
          cdk: {
            certificate: Certificate.fromCertificateArn(
              stack,
              "frontend-cert",
              "arn:aws:acm:us-east-1:634758516618:certificate/a31ab2f6-b356-477a-a3c4-508124fd82f9"
            ),
          },
        }
        : undefined,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
    SiteUrl: site.customDomainUrl || site.url,
  });
}
