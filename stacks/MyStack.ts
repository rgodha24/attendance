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
          domainName: "api.batt.rohan.zip",
          isExternalDomain: true,
          cdk: {
            certificate: Certificate.fromCertificateArn(
              stack,
              "api-cert",
              "arn:aws:acm:us-east-1:634758516618:certificate/203252d3-e2d5-495e-9595-8031ba3eab1b"
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
          domainName: "batt.rohan.zip",
          isExternalDomain: true,
          cdk: {
            certificate: Certificate.fromCertificateArn(
              stack,
              "frontend-cert",
              "arn:aws:acm:us-east-1:634758516618:certificate/399d0acd-e2d8-4831-be56-6460b27e5fe1"
            ),
          },
        }
        : undefined,
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteUrl: site.url,
  });
}
