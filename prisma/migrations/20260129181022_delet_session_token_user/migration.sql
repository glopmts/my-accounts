/*
  Warnings:

  - You are about to drop the column `sessionToken` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionToken]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_sessionToken_key";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "isValid" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sessionToken" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sessionToken";

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
