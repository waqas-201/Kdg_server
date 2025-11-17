import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { classifiedApps } from "@/services/clisssifier";

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
  console.log("Inside check route");

  const body: { appNames: AppInput[] } = await request.json();
  const { appNames } = body;

  if (!appNames || !Array.isArray(appNames)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // ---------------------------------------
  // 1. Split: Check DB cache
  // ---------------------------------------
  const cachedApps: AppResult[] = [];
  const appsToClassify: AppInput[] = [];

  for (const app of appNames) {
    const record = await prisma.app.findUnique({
      where: { packageName: app.packageName }
    });

    if (record) {
      cachedApps.push({
        packageName: record.packageName,
        appName: record.appName,
        isKidSafe: record.isKidSafe,
        minAge: record.minAge,
      });
    } else {
      appsToClassify.push(app);
    }
  }

  console.log("Apps already cached:", cachedApps.length);
  console.log("Apps needing classification:", appsToClassify.length);

  // ---------------------------------------
  // 2. Only classify missing apps
  // ---------------------------------------
  let classified: AppResult[] = [];

  if (appsToClassify.length > 0) {

    const result = await classifiedApps(appsToClassify);

    if (!result) {
      return NextResponse.json({ error: "Classifier failed" }, { status: 500 });
    }

    classified = result;

    // ---------------------------------------
    // 3. Save classifier results to DB cache
    // ---------------------------------------
    await upsertApps(classified);
  }

  // ---------------------------------------
  // 4. Merge: cached + newly classified
  // ---------------------------------------
  const finalApps = [...cachedApps, ...classified];

  // console.log("Total returned to client:", finalApps);

  const kidSafeApps = finalApps.filter(app => app.isKidSafe);



  return NextResponse.json({
    message: "Classification completed",
    apps: kidSafeApps,
  });
}




async function upsertApps(appsList: AppResult[]) {
  try {
    await prisma.$transaction(
      appsList.map((app) =>
        prisma.app.upsert({
          where: { packageName: app.packageName },
          update: {
            appName: app.appName,
            isKidSafe: app.isKidSafe,
            minAge: app.minAge,
          },
          create: {
            packageName: app.packageName,
            appName: app.appName,
            isKidSafe: app.isKidSafe,
            minAge: app.minAge,
          },
        })
      )
    );
  } catch (error) {
    console.error("Prisma upsert error:", error);
  }
}


const checkDbCout = async () => {
  const count = await prisma.app.findMany();
  console.log("Total apps in DB:", count.length);
}
