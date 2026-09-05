import app from "./app";
import { dispatchActivityReminders } from "./lib/activity-reminders";
import { logger } from "./lib/logger";
import { runRetentionJobs } from "./lib/retention";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port, host }, "Server listening");
  void runRetentionJobs().catch((err) => {
    logger.warn({ err }, "Retention jobs failed at startup");
  });
  void dispatchActivityReminders().catch((err) => {
    logger.warn({ err }, "Activity reminders dispatch failed at startup");
  });

  const reminderIntervalMs = 6 * 60 * 60 * 1000;
  setInterval(() => {
    void dispatchActivityReminders().catch((err) => {
      logger.warn({ err }, "Activity reminders dispatch failed");
    });
  }, reminderIntervalMs);
});
