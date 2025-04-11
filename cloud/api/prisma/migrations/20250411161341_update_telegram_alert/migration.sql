-- AlterTable
ALTER TABLE "TelegramAlertSource" DROP COLUMN "token",
ADD COLUMN     "chatId" TEXT NOT NULL;
