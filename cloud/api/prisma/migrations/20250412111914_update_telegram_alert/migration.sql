-- AlterTable
ALTER TABLE "SentAlert" ADD COLUMN     "activatedBinId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TelegramAlertSource" ADD COLUMN     "activationCode" UUID NOT NULL,
ADD COLUMN     "username" TEXT,
ALTER COLUMN "chatId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TelegramAlertSource_activationCode_key" ON "TelegramAlertSource"("activationCode");

-- AddForeignKey
ALTER TABLE "SentAlert" ADD CONSTRAINT "SentAlert_activatedBinId_fkey" FOREIGN KEY ("activatedBinId") REFERENCES "ActivatedBin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Measurement" DROP CONSTRAINT "Measurement_pkey",
ALTER COLUMN "measuredAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "Measurement_pkey" PRIMARY KEY ("measuredAt", "activatedBinId");

-- Fix organization delete
ALTER TABLE "ActivatedBin" DROP CONSTRAINT "ActivatedBin_organizationId_fkey",
ADD CONSTRAINT "ActivatedBin_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;