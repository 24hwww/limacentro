-- CreateTable
CREATE TABLE "ActiveUser" (
    "id" TEXT NOT NULL,
    "lastPing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActiveUser_pkey" PRIMARY KEY ("id")
);
