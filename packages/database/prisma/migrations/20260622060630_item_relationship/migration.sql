/*
  Warnings:

  - Added the required column `adminOwnerId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "adminOwnerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_adminOwnerId_fkey" FOREIGN KEY ("adminOwnerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
