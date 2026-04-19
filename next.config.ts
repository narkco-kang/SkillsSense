import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["165.154.149.84"],
};

const sentryConfig = withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-javascript/blob/develop/apps/nextjs/src/config.ts
  org: process.env.SENTRY_ORG,
  project: "skillssense",
});

export default sentryConfig;
