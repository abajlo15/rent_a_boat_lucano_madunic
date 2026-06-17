/**
 * DEPRECATED: Use manual curation instead. See public/destinations/README.md.
 *
 * Downloads curated Wikimedia files for destinations missing from bulk search.
 * Run: node scripts/download-fallback-images.mjs
 */

import { writeFile, access } from "node:fs/promises";
import path from "node:path";
import { constants } from "node:fs";

const ROOT = path.resolve("public/destinations");
const WIDTH = 1280;

const fallbacks = {
  olib: ["File:Olib2.jpg", "File:Olib3.jpg", "File:Olib (village seen from NW).jpg"],
  silba: ["File:Silba, Croatia.jpg", "File:Silba island.jpg", "File:Silba1.jpg"],
  "lazaret-osljak": ["File:Otok Ošljak.jpg", "File:Ošljak (island).jpg", "File:Otok Ošljak 2.jpg"],
  kostanj: ["File:Ugljan island.jpg", "File:Preko, Ugljan.jpg", "File:Ugljan (island).jpg"],
  frnaza: ["File:Ugljan island coast.jpg", "File:Bay on Ugljan.jpg", "File:Ugljan.jpg"],
  skoljic: ["File:Galevac.jpg", "File:Preko - otok Galevac.jpg", "File:Otok Galevac.jpg"],
  preko: ["File:Preko, Ugljan.jpg", "File:Preko (Ugljan).jpg", "File:Preko harbour.jpg"],
  kali: ["File:Kali, Ugljan.jpg", "File:Kali (Ugljan).jpg", "File:Kali Croatia.jpg"],
  muline: ["File:Muline.jpg", "File:Ugljan island bay.jpg", "File:Sunset Ugljan.jpg"],
};

const credits = [];

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function fetchByTitle(title) {
  const params = new URLSearchParams({
    action: "query",
    titles: title,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: String(WIDTH),
    format: "json",
    origin: "*",
  });

  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const page = Object.values(data?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl) {
    return null;
  }

  return {
    url: info.thumburl,
    title,
    artist: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") ?? "Unknown",
    license: info.extmetadata?.LicenseShortName?.value ?? "See Wikimedia Commons",
    pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`,
  };
}

async function downloadImage(url, destPath, retries = 6) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(destPath, buffer);
      return;
    }

    if (response.status === 429 && attempt < retries) {
      const waitMs = 3000 * (attempt + 1);
      console.warn(`Rate limited, waiting ${waitMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    throw new Error(`HTTP ${response.status}`);
  }
}

async function resolveFiles(slug, titles) {
  const resolved = [];
  for (const title of titles) {
    const result = await fetchByTitle(title);
    if (result) {
      resolved.push(result);
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  if (resolved.length >= 3) {
    return resolved.slice(0, 3);
  }

  const backupSearch = await fetch(
    `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `filetype:bitmap ${slug.replace(/-/g, " ")} Croatia`,
      gsrnamespace: "6",
      gsrlimit: "6",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: String(WIDTH),
      format: "json",
      origin: "*",
    })}`,
  );

  if (backupSearch.ok) {
    const data = await backupSearch.json();
    for (const page of Object.values(data?.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info?.thumburl) continue;
      resolved.push({
        url: info.thumburl,
        title: page.title,
        artist: info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "") ?? "Unknown",
        license: info.extmetadata?.LicenseShortName?.value ?? "See Wikimedia Commons",
        pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title ?? "")}`,
      });
      if (resolved.length >= 3) break;
    }
  }

  return resolved.slice(0, 3);
}

async function main() {
  for (const [slug, titles] of Object.entries(fallbacks)) {
    const dir = path.join(ROOT, slug);
    const picks = await resolveFiles(slug, titles);

    if (picks.length < 3) {
      console.warn(`Warning: only ${picks.length} images resolved for ${slug}`);
    }

    credits.push(`## ${slug}`);
    let index = 1;
    for (const pick of picks) {
      const filename = `${String(index).padStart(2, "0")}.jpg`;
      const destPath = path.join(dir, filename);

      if (!(await fileExists(destPath))) {
        try {
          await downloadImage(pick.url, destPath);
          console.log(`Saved ${slug}/${filename}`);
        } catch (error) {
          console.error(`Failed ${slug}/${filename}:`, error.message);
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.log(`Skip existing ${slug}/${filename}`);
      }

      credits.push(
        `- ${filename} — ${pick.artist.trim()}, [${pick.title}](${pick.pageUrl}), ${pick.license}`,
      );
      index += 1;
    }
    credits.push("");
  }

  const creditsPath = path.join(ROOT, "IMAGE_CREDITS_FALLBACK.md");
  await writeFile(
    creditsPath,
    `# Fallback destination image credits\n\n${credits.join("\n")}`,
    "utf8",
  );
  console.log(`Credits written to ${creditsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
