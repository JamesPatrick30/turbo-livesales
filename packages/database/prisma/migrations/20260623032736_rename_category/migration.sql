/*
  Warnings:

  - You are about to drop the column `cathegory` on the `SaleItem` table. All the data in the column will be lost.
  - Added the required column `category` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SaleItem_cathegory_idx";

-- AlterTable
ALTER TABLE "SaleItem" DROP COLUMN "cathegory",
ADD COLUMN     "category" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SaleItem_category_idx" ON "SaleItem"("category");
