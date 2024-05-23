/*
  Warnings:

  - You are about to drop the column `reviewers` on the `User` table. All the data in the column will be lost.
  - Added the required column `reviewers` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "reviewers" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "reviewers";
