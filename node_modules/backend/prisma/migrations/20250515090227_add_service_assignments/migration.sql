-- CreateTable
CREATE TABLE "_ServiceAssignments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ServiceAssignments_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ServiceAssignments_B_index" ON "_ServiceAssignments"("B");

-- AddForeignKey
ALTER TABLE "_ServiceAssignments" ADD CONSTRAINT "_ServiceAssignments_A_fkey" FOREIGN KEY ("A") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ServiceAssignments" ADD CONSTRAINT "_ServiceAssignments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
