/*
  Warnings:

  - You are about to alter the column `height` on the `MoodBlock` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `width` on the `MoodBlock` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "MoodBlock" ALTER COLUMN "height" SET DATA TYPE INTEGER,
ALTER COLUMN "width" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "ProfileVersion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "profileData" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileVersion_profileId_idx" ON "ProfileVersion"("profileId");

-- CreateIndex
CREATE INDEX "ProfileVersion_profileId_isActive_idx" ON "ProfileVersion"("profileId", "isActive");

-- AddForeignKey
ALTER TABLE "ProfileVersion" ADD CONSTRAINT "ProfileVersion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
