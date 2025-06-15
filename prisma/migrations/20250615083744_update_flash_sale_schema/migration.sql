/*
  Warnings:

  - You are about to drop the column `discountPercentage` on the `FlashSaleProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flashSaleId,productId]` on the table `FlashSaleProduct` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `discountPrice` to the `FlashSaleProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FlashSaleProduct" DROP CONSTRAINT "FlashSaleProduct_flashSaleId_fkey";

-- DropForeignKey
ALTER TABLE "FlashSaleProduct" DROP CONSTRAINT "FlashSaleProduct_productId_fkey";

-- AlterTable
ALTER TABLE "FlashSaleProduct" DROP COLUMN "discountPercentage",
ADD COLUMN     "discountPrice" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FlashSaleProduct_flashSaleId_productId_key" ON "FlashSaleProduct"("flashSaleId", "productId");

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
