/*
  Warnings:

  - A unique constraint covering the columns `[receiptNo]` on the table `Sales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiptNo` to the `Sales` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sales" ADD COLUMN     "receiptNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sales_receiptNo_key" ON "Sales"("receiptNo");
