-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE "ProjectUpdateType" AS ENUM ('GENERAL', 'MILESTONE', 'HARVEST');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "location" TEXT NOT NULL DEFAULT '';
ALTER TABLE "projects" ADD COLUMN "risk_level" "RiskLevel" NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "projects" ADD COLUMN "ai_score" DECIMAL(5,2);
ALTER TABLE "projects" ADD COLUMN "harvest_timeline" TEXT;

-- AlterTable
ALTER TABLE "project_media" ADD COLUMN "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE';

-- AlterTable
ALTER TABLE "project_updates" ADD COLUMN "update_type" "ProjectUpdateType" NOT NULL DEFAULT 'GENERAL';
