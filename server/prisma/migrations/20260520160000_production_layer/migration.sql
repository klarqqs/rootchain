-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INVESTMENT', 'TRANSACTION', 'PROJECT', 'MILESTONE', 'ADMIN', 'SYSTEM');
CREATE TYPE "ActivityVisibility" AS ENUM ('PUBLIC', 'INVESTORS', 'ADMIN');
CREATE TYPE "ActivityType" AS ENUM ('INVESTMENT_CONFIRMED', 'PROJECT_UPDATE', 'PROJECT_SUBMITTED', 'PROJECT_APPROVED', 'PROJECT_FUNDED', 'FARMER_VERIFIED', 'ADMIN_REVIEW', 'FUNDING_PROGRESS');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "trust_score" DECIMAL(5,2);
ALTER TABLE "projects" ADD COLUMN "predicted_roi_pct" DECIMAL(5,2);
ALTER TABLE "projects" ADD COLUMN "ai_factors" JSONB;

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_activities" (
    "id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "visibility" "ActivityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "project_id" UUID,
    "actor_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX "platform_activities_project_id_idx" ON "platform_activities"("project_id");
CREATE INDEX "platform_activities_created_at_idx" ON "platform_activities"("created_at");
CREATE INDEX "platform_activities_type_idx" ON "platform_activities"("type");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "platform_activities" ADD CONSTRAINT "platform_activities_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "platform_activities" ADD CONSTRAINT "platform_activities_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
