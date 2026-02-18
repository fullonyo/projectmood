-- AlterTable
ALTER TABLE "MoodBlock" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "width" INTEGER,
ADD COLUMN     "x" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "y" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zIndex" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "backgroundEffect" TEXT DEFAULT 'none',
ADD COLUMN     "customCursor" TEXT DEFAULT 'auto',
ADD COLUMN     "customFont" TEXT DEFAULT 'Inter',
ADD COLUMN     "mouseTrails" TEXT DEFAULT 'none',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "GuestbookMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "blockId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestbookMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileAnalytics" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "lastViewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuestbookMessage_blockId_idx" ON "GuestbookMessage"("blockId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileAnalytics_profileId_key" ON "ProfileAnalytics"("profileId");

-- CreateIndex
CREATE INDEX "ProfileAnalytics_profileId_idx" ON "ProfileAnalytics"("profileId");

-- CreateIndex
CREATE INDEX "MoodBlock_userId_idx" ON "MoodBlock"("userId");

-- CreateIndex
CREATE INDEX "MoodBlock_userId_type_idx" ON "MoodBlock"("userId", "type");

-- AddForeignKey
ALTER TABLE "GuestbookMessage" ADD CONSTRAINT "GuestbookMessage_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "MoodBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileAnalytics" ADD CONSTRAINT "ProfileAnalytics_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
