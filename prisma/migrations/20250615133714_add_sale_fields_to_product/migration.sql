-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPrice" INTEGER,
ADD COLUMN     "isSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saleEndDate" TIMESTAMP(3);
