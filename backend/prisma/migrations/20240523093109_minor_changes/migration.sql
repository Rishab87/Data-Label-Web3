/*
  Warnings:

  - You are about to drop the column `amount` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `finished` on the `Task` table. All the data in the column will be lost.
  - Changed the type of `amount` on the `Task` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pending_amount` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `locked_amount` on the `Worker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "amount";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "finished",
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "pending_amount",
ADD COLUMN     "pending_amount" INTEGER NOT NULL,
DROP COLUMN "locked_amount",
ADD COLUMN     "locked_amount" INTEGER NOT NULL;
