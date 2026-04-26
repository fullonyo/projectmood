-- 1. Criar o Enum RoomType
CREATE TYPE "RoomType" AS ENUM ('PERMANENT', 'TEMPORARY');

-- 2. Renomear a tabela Profile para Room
ALTER TABLE "Profile" RENAME TO "Room";

-- 3. Adicionar novas colunas à Room
ALTER TABLE "Room" ADD COLUMN "title" TEXT NOT NULL DEFAULT 'Meu Espaço';
ALTER TABLE "Room" ADD COLUMN "slug" TEXT;
ALTER TABLE "Room" ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Room" ADD COLUMN "type" "RoomType" NOT NULL DEFAULT 'PERMANENT';
ALTER TABLE "Room" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- 4. Criar os índices para Room
CREATE UNIQUE INDEX "Room_slug_key" ON "Room"("slug");
CREATE INDEX "Room_userId_idx" ON "Room"("userId");
CREATE INDEX "Room_slug_idx" ON "Room"("slug");

-- 5. Renomear ProfileVersion para RoomVersion e Analytics
ALTER TABLE "ProfileVersion" RENAME TO "RoomVersion";
ALTER TABLE "ProfileAnalytics" RENAME TO "RoomAnalytics";

-- 6. Ajustar MoodBlock - PASSO CRÍTICO DE MAPEAMENTO
-- Primeiro, adicionamos a nova coluna roomId que aceita null temporariamente
ALTER TABLE "MoodBlock" ADD COLUMN "temp_roomId" TEXT;

-- Mapeamos os IDs: MoodBlock.userId -> Room.id (onde Room.userId == MoodBlock.userId)
UPDATE "MoodBlock" SET "temp_roomId" = "Room"."id" FROM "Room" WHERE "MoodBlock"."userId" = "Room"."userId";

-- Agora podemos remover a coluna userId e tornar temp_roomId a oficial
ALTER TABLE "MoodBlock" DROP COLUMN "userId";
ALTER TABLE "MoodBlock" RENAME COLUMN "temp_roomId" TO "roomId";
ALTER TABLE "MoodBlock" ALTER COLUMN "roomId" SET NOT NULL;

-- 7. Fazer o mesmo para RoomVersion e RoomAnalytics
ALTER TABLE "RoomVersion" RENAME COLUMN "profileId" TO "roomId";
ALTER TABLE "RoomAnalytics" RENAME COLUMN "profileId" TO "roomId";

-- 8. Recriar as Foreign Keys
ALTER TABLE "Room" DROP CONSTRAINT "Profile_userId_fkey";
ALTER TABLE "RoomVersion" DROP CONSTRAINT "ProfileVersion_profileId_fkey";
ALTER TABLE "RoomAnalytics" DROP CONSTRAINT "ProfileAnalytics_profileId_fkey";

ALTER TABLE "Room" ADD CONSTRAINT "Room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoomVersion" ADD CONSTRAINT "RoomVersion_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MoodBlock" ADD CONSTRAINT "MoodBlock_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoomAnalytics" ADD CONSTRAINT "RoomAnalytics_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Atualizar Índices
CREATE INDEX "RoomVersion_roomId_idx" ON "RoomVersion"("roomId");
CREATE INDEX "RoomVersion_roomId_isActive_idx" ON "RoomVersion"("roomId", "isActive");
CREATE INDEX "RoomAnalytics_roomId_idx" ON "RoomAnalytics"("roomId");
CREATE INDEX "MoodBlock_roomId_idx" ON "MoodBlock"("roomId");
CREATE INDEX "MoodBlock_roomId_type_idx" ON "MoodBlock"("roomId", "type");
