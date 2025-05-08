DELETE FROM "AlertSource";

-- AlterTable
ALTER TABLE "AlertSource" ADD COLUMN     "thresholdPercent" INTEGER;

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "alertThresholdPercent";
