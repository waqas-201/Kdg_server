import { NextRequest, NextResponse } from "next/server";
import { apps } from "@/db/schema"; // Your apps table definition
import { inArray, eq } from "drizzle-orm";
import { classifiedApps } from "@/services/clisssifier";
import { db } from "@/db/db";

// --------------------- TYPES ---------------------
interface AppInput {
  packageName: string;
  appName: string;
}

export interface AppResult {
  packageName: string;
  appName: string;
  isKidSafe: boolean;
  minAge: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: { appNames: AppInput[] } = await request.json();
    const { appNames } = body;

    if (!appNames || !Array.isArray(appNames)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const packageNames = appNames.map((a) => a.packageName);

    // ---------------------------------------
    // 1. Check DB Cache (ONE QUERY, NOT A LOOP)
    // ---------------------------------------
    const cachedApps = await db
      .select()
      .from(apps)
      .where(inArray(apps.packageName, packageNames));

    const cachedPackageNames = new Set(cachedApps.map((a) => a.packageName));

    // Identify which apps are missing from the cache
    const appsToClassify = appNames.filter(
      (app) => !cachedPackageNames.has(app.packageName)
    );

    console.log("Apps already cached:", cachedApps.length);
    console.log("Apps needing classification:", appsToClassify.length);

    // ---------------------------------------
    // 2. Classify missing apps
    // ---------------------------------------
    let newlyClassified: AppResult[] = [];

    if (appsToClassify.length > 0) {
      const result = await classifiedApps(appsToClassify);

      if (!result) {
        return NextResponse.json({ error: "Classifier failed" }, { status: 500 });
      }

      newlyClassified = result;

      // ---------------------------------------
      // 3. Save to DB (BULK UPSERT)
      // ---------------------------------------
      await upsertApps(newlyClassified);
    }

    // ---------------------------------------
    // 4. Merge and Filter
    // ---------------------------------------
    const finalApps = [...cachedApps, ...newlyClassified];
    const kidSafeApps = finalApps.filter((app) => app.isKidSafe);

    return NextResponse.json({
      message: "Classification completed",
      apps: kidSafeApps,
    });

  } catch (error) {
    console.error("Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Bulk Upsert: This is much faster .
 * It sends ONE command to PostgreSQL.
 */
async function upsertApps(appsList: AppResult[]) {
  if (appsList.length === 0) return;

  await db
    .insert(apps)
    .values(appsList)
    .onConflictDoUpdate({
      target: apps.packageName, // The unique column
      set: {
        appName: apps.appName,
        isKidSafe: apps.isKidSafe,
        minAge: apps.minAge,
      },
    });
}

