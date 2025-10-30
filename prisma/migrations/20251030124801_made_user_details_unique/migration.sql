/*
  Warnings:

  - A unique constraint covering the columns `[userDetails]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_userDetails_key" ON "Order"("userDetails");
