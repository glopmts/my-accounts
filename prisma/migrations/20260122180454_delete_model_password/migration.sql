/*
  Warnings:

  - You are about to drop the `PasswordAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordAccount" DROP CONSTRAINT "PasswordAccount_myAccountId_fkey";

-- AlterTable
ALTER TABLE "MyAccounts" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "password" TEXT[];

-- DropTable
DROP TABLE "PasswordAccount";
