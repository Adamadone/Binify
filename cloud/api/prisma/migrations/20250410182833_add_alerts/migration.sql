-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "alertThresholdPercent" INTEGER;
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_alertThresholdPercent_limits" CHECK ("alertThresholdPercent" > 0 and "alertThresholdPercent" <= 100);

-- CreateTable
CREATE TABLE "AlertSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "repeatMinutes" INTEGER,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "AlertSource_repeatMinutes_min" CHECK ("repeatMinutes" > 0),
    CONSTRAINT "AlertSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramAlertSource" (
    "alertSourceId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "TelegramAlertSource_pkey" PRIMARY KEY ("alertSourceId")
);

-- CreateTable
CREATE TABLE "SentAlert" (
    "id" SERIAL NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "alertSourceId" INTEGER NOT NULL,

    CONSTRAINT "SentAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlertSource" ADD CONSTRAINT "AlertSource_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelegramAlertSource" ADD CONSTRAINT "TelegramAlertSource_alertSourceId_fkey" FOREIGN KEY ("alertSourceId") REFERENCES "AlertSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentAlert" ADD CONSTRAINT "SentAlert_alertSourceId_fkey" FOREIGN KEY ("alertSourceId") REFERENCES "AlertSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
