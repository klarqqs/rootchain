import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

/**
 * Email rail — logs in development; wire Resend/SendGrid via EMAIL_PROVIDER env.
 */
export async function sendEmailNotification(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<void> {
  if (!env.EMAIL_ENABLED) {
    if (env.NODE_ENV === "development") {
      logger.info({ to: input.to, subject: input.subject }, "Email skipped (EMAIL_ENABLED=false)");
    }
    return;
  }

  // Placeholder for production provider
  logger.info(
    { to: input.to, subject: input.subject, provider: env.EMAIL_PROVIDER },
    "Email notification queued",
  );
}
