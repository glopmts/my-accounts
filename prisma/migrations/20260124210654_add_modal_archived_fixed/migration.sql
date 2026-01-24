-- AlterTable
ALTER TABLE "MyAccounts" ADD COLUMN     "category" TEXT,
ADD COLUMN     "orderInCategory" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SortingCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SortingCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fixed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "myaccountId" TEXT NOT NULL,
    "isFixed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fixed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archived" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "myaccountId" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Archived_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SortingCategory" ADD CONSTRAINT "SortingCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixed" ADD CONSTRAINT "Fixed_myaccountId_fkey" FOREIGN KEY ("myaccountId") REFERENCES "MyAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixed" ADD CONSTRAINT "Fixed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archived" ADD CONSTRAINT "Archived_myaccountId_fkey" FOREIGN KEY ("myaccountId") REFERENCES "MyAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archived" ADD CONSTRAINT "Archived_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
