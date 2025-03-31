-- EnableTimescaledb
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- CreateTable
CREATE TABLE "Measurement" (
    "measuredAt" TIMESTAMPTZ NOT NULL,
    "distanceCentimeters" INTEGER NOT NULL CHECK("distanceCentimeters" >= 0),
    "airQualityPpm" INTEGER NOT NULL CHECK("distanceCentimeters" BETWEEN 0 AND 1_000_000),
    "activatedBinId" INTEGER NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("measuredAt", "activatedBinId")
);

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_activatedBinId_fkey" FOREIGN KEY ("activatedBinId") REFERENCES "ActivatedBin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateHiberatble
SELECT create_hypertable('"Measurement"', by_range('measuredAt'));
