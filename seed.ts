import prisma from "./lib/prisma";


async function main() {
    const apps = [
        {
            packageName: "com.google.android.youtube",
            appName: "YouTube",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
        {
            packageName: "org.telegram.messenger",
            appName: "Telegram",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
        {
            packageName: "com.whatsapp",
            appName: "WhatsApp",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
        {
            packageName: "com.google.android.apps.docs",
            appName: "Google Drive",
            isKidSafe: true,
            minAge: 5,
            icon: "",
        },
        {
            packageName: "com.google.android.apps.maps",
            appName: "Google Maps",
            isKidSafe: true,
            minAge: 10,
            icon: "",
        },
        {
            packageName: "com.spotify.music",
            appName: "Spotify",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
        {
            packageName: "com.transsion.magicshow",
            appName: "Visha Player",
            isKidSafe: true,
            minAge: 5,
            icon: "",
        },
        {
            packageName: "com.google.android.apps.photos",
            appName: "Google Photos",
            isKidSafe: true,
            minAge: 5,
            icon: "",
        },
        {
            packageName: "com.facebook.katana",
            appName: "Facebook",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
        {
            packageName: "com.google.android.apps.youtube.music",
            appName: "YouTube Music",
            isKidSafe: false,
            minAge: 16,
            icon: "",
        },
    ];

    for (const app of apps) {
        await prisma.app.upsert({
            where: { packageName: app.packageName },
            update: app,
            create: app,
        });
    }

    console.log("✅ Seeded top 10 apps!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
