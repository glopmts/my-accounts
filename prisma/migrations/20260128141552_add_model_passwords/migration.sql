/*
  Warnings:

  - You are about to drop the column `password` on the `MyAccounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MyAccounts" DROP COLUMN "password";

-- CreateTable
CREATE TABLE "Password" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT,
    "hint" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Password_accountId_idx" ON "Password"("accountId");

-- AddForeignKey
ALTER TABLE "Password" ADD CONSTRAINT "Password_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "MyAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
