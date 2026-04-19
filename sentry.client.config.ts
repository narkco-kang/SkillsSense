import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
  // Performance monitoring
  tracesSampleRate: 0.1,
  // Session replay for debugging user issues
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  // Don't send server errors from localhost dev
  sendClientReports: false,
});
