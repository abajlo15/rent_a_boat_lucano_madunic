/**
 * DEPRECATED: Automatic Wikimedia downloads produced poor results (maps, crowds, wrong subjects).
 * Add images manually per public/destinations/README.md (nature/landscape only).
 *
 * Downloads 3 Wikimedia Commons images per destination into public/destinations/{slug}/.
 * Run: node scripts/download-destination-images.mjs
 */

import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

const ROOT = path.resolve("public/destinations");
const WIDTH = 1280;

const destinations = [
  { slug: "telascica", searches: ["Telascica Croatia", "Telascica nature park", "Lake Mir Dugi Otok"] },
  { slug: "kornati", searches: ["Kornati islands Croatia", "Kornati national park", "Kornati archipelago"] },
  { slug: "saharun", searches: ["Sakarun beach Croatia", "Sahara beach Dugi Otok", "Sakarun Dugi Otok"] },
  { slug: "potopljeni-brod", searches: ["Veli Rat lighthouse Croatia", "Dugi Otok lighthouse", "Veli Rat Dugi Otok"] },
  { slug: "titove-spilje", searches: ["Blue Cave Vis Croatia", "Modra špilja Vis", "Tito caves Vis"] },
  { slug: "golubinka", searches: ["Dugi Otok cave Croatia", "Dugi Otok coast", "Dugi Otok bay"] },
  { slug: "vodenjak", searches: ["Iz island Croatia", "Iž Croatia bay", "Iz island beach"] },
  { slug: "olib", searches: ["Olib island Croatia", "Olib beach", "Olib Croatia"] },
  { slug: "silba", searches: ["Silba island Croatia", "Silba beach", "Silba Croatia"] },
  { slug: "lazaret-osljak", searches: ["Osljak island Croatia", "Ošljak Zadar", "Osljak bay"] },
  { slug: "kostanj", searches: ["Ugljan island beach Croatia", "Ugljan bay", "Kostanj Ugljan"] },
  { slug: "frnaza", searches: ["Ugljan island cove Croatia", "Ugljan coast", "Frnaza Ugljan"] },
  { slug: "skoljic", searches: ["Galevac island Croatia", "Preko Galevac", "Skoljic Preko"] },
  { slug: "preko", searches: ["Preko Ugljan Croatia", "Preko harbour", "Preko ferry port"] },
  { slug: "kali", searches: ["Kali Ugljan Croatia", "Kali fishing village", "Kali island Croatia"] },
  { slug: "muline", searches: ["Muline Ugljan Croatia", "Muline bay Ugljan", "Ugljan sunset bay"] },
];

const credits = [];

async function searchCommons(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "8",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(WIDTH),
    format: "json",
    origin: "*",
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const pages = data?.query?.pages;
  if (!pages) {
    return [];
  }

  return Object.values(pages)
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl) {
        return null;
      }

      const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") ?? "Unknown";
      const license = info.extmetadata?.LicenseShortName?.value ?? "See Wikimedia Commons";
      const description = page.title ?? query;

      return {
        url: info.thumburl,
        title: description,
        artist,
        license,
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title ?? "")}`,
      };
    })
    .filter(Boolean);
}

async function downloadImage(url, destPath, retries = 5) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destPath, buffer);
      return;
    }

    if (response.status === 429 && attempt < retries) {
      const waitMs = 2000 * (attempt + 1);
      console.warn(`Rate limited, waiting ${waitMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    throw new Error(`HTTP ${response.status} for ${url}`);
  }
}

function uniqueByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) {
      return false;
    }
    seen.add(item.url);
    return true;
  });
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  for (const destination of destinations) {
    const dir = path.join(ROOT, destination.slug);
    await mkdir(dir, { recursive: true });

    const collected = [];
    for (const query of destination.searches) {
      const results = await searchCommons(query);
      collected.push(...results);
      if (collected.length >= 3) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const picks = uniqueByUrl(collected).slice(0, 3);
    if (picks.length < 3) {
      console.warn(`Warning: only found ${picks.length} images for ${destination.slug}`);
    }

    credits.push(`## ${destination.slug}`);
    let index = 1;
    for (const pick of picks) {
      const filename = `${String(index).padStart(2, "0")}.jpg`;
      const destPath = path.join(dir, filename);

      if (await fileExists(destPath)) {
        console.log(`Skip existing ${destination.slug}/${filename}`);
        credits.push(
          `- ${filename} — ${pick.artist.trim()}, [${pick.title}](${pick.pageUrl}), ${pick.license}`,
        );
        index += 1;
        continue;
      }

      try {
        await downloadImage(pick.url, destPath);
        console.log(`Saved ${destination.slug}/${filename}`);
      } catch (error) {
        console.error(`Failed ${destination.slug}/${filename}:`, error.message);
      }

      credits.push(
        `- ${filename} — ${pick.artist.trim()}, [${pick.title}](${pick.pageUrl}), ${pick.license}`,
      );
      index += 1;
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
    credits.push("");
  }

  const creditsPath = path.join(ROOT, "IMAGE_CREDITS.md");
  const header = `# Destination image credits

Images sourced from Wikimedia Commons unless noted otherwise. Replace with your own photography for production if preferred.

`;
  await writeFile(creditsPath, header + credits.join("\n"), "utf8");
  console.log(`\nCredits written to ${creditsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
