-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "packageName" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "isKidSafe" BOOLEAN NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "App_packageName_key" ON "App"("packageName");
