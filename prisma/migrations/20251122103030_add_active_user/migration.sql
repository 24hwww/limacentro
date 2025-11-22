-- CreateTable
CREATE TABLE "activeUser" (
    "id" TEXT NOT NULL,
    "lastPing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activeUser_pkey" PRIMARY KEY ("id")
);
