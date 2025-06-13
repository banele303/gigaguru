/*
  Warnings:

  - You are about to drop the column `minPurchase` on the `DiscountCode` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `DiscountCode` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `DiscountCode` table. All the data in the column will be lost.
  - You are about to drop the `_FlashSaleToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FlashSaleToProduct" DROP CONSTRAINT "_FlashSaleToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_FlashSaleToProduct" DROP CONSTRAINT "_FlashSaleToProduct_B_fkey";

-- AlterTable
ALTER TABLE "DiscountCode" DROP COLUMN "minPurchase",
DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "percentage" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FlashSale" ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "_FlashSaleToProduct";

-- CreateTable
CREATE TABLE "FlashSaleProduct" (
    "id" TEXT NOT NULL,
    "flashSaleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "discountPercentage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashSaleProduct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_flashSaleId_fkey" FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashSaleProduct" ADD CONSTRAINT "FlashSaleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
