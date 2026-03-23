-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "profileImage" TEXT,
    "coverImage" TEXT,
    "companyLogo" TEXT,
    "themeColor" TEXT NOT NULL DEFAULT '#1A171B',
    "mobile" TEXT,
    "email" TEXT,
    "sms" TEXT,
    "whatsapp" TEXT,
    "addressTitle" TEXT,
    "street" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "addressUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT,
    "cardId" TEXT NOT NULL,
    CONSTRAINT "Link_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Social" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT,
    "cardId" TEXT NOT NULL,
    CONSTRAINT "Social_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");
