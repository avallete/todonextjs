-- CreateEnum
CREATE TYPE "vote_value" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "vote" (
    "id" SERIAL NOT NULL,
    "todo_id" INTEGER NOT NULL,
    "value" "vote_value" NOT NULL DEFAULT 'UPVOTE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vote" ADD CONSTRAINT "vote_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "todo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
