/*
  Warnings:

  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Servis Adı';
