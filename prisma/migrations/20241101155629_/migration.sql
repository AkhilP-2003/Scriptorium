/*
  Warnings:

  - You are about to drop the column `parentTemplateId` on the `Code` table. All the data in the column will be lost.
  - Added the required column `associatedTemplateId` to the `Code` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Code" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "associatedTemplateId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Code_associatedTemplateId_fkey" FOREIGN KEY ("associatedTemplateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Code" ("createdAt", "error", "id", "input", "language", "output", "updatedAt") SELECT "createdAt", "error", "id", "input", "language", "output", "updatedAt" FROM "Code";
DROP TABLE "Code";
ALTER TABLE "new_Code" RENAME TO "Code";
CREATE UNIQUE INDEX "Code_associatedTemplateId_key" ON "Code"("associatedTemplateId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
