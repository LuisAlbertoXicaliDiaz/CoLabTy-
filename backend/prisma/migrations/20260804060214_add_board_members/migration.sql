-- CreateTable
CREATE TABLE "UserBoard" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "boardId" TEXT NOT NULL,

    CONSTRAINT "UserBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBoard_userId_boardId_key" ON "UserBoard"("userId", "boardId");

-- AddForeignKey
ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBoard" ADD CONSTRAINT "UserBoard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
