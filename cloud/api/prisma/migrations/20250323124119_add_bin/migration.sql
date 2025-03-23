/*
  Warnings:

  - Added the required column `isSuperAdmin` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VIEWER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Bin" (
    "id" SERIAL NOT NULL,
    "deviceId" UUID NOT NULL,
    "activationCode" TEXT NOT NULL,

    CONSTRAINT "Bin_activationCode_format" CHECK ("activationCode"~ '^[0-9]{6}$'),
    CONSTRAINT "Bin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivatedBin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL,
    "binId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "ActivatedBin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "role" "Role" NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bin_activationCode_key" ON "Bin"("activationCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bin_deviceId_key" ON "Bin"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivatedBin_binId_key" ON "ActivatedBin"("binId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_organizationId_key" ON "Member"("organizationId");

-- AddForeignKey
ALTER TABLE "ActivatedBin" ADD CONSTRAINT "ActivatedBin_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivatedBin" ADD CONSTRAINT "ActivatedBin_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
