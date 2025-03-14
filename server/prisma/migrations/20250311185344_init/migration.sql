-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_authorUserId_fkey";

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "authorUserId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("cognitoId") ON DELETE SET NULL ON UPDATE CASCADE;
