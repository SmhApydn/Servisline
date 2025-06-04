/*
  Warnings:

  - A unique constraint covering the columns `[userId,date,period]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_period_key" ON "Attendance"("userId", "date", "period");
