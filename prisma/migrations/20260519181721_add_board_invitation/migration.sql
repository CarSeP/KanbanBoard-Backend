-- CreateTable
CREATE TABLE "BoardInvitation" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "token" VARCHAR(32) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardInvitation_token_key" ON "BoardInvitation"("token");

-- AddForeignKey
ALTER TABLE "BoardInvitation" ADD CONSTRAINT "BoardInvitation_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardInvitation" ADD CONSTRAINT "BoardInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
