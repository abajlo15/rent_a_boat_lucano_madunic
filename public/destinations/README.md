# Destination images

Each destination has its own folder under `public/destinations/`, named after the location `slug` from `src/data/archipelago-locations.ts`.

## Folder layout

```
destinations/
  {slug}/
    01.jpg      ← carousel image 1
    02.jpg      ← carousel image 2
    03.jpg      ← carousel image 3
    gallery/    ← optional extra photos for future gallery UI
```

## Image style (important)

Use **nature and landscape only** — the same style as the Sakarun reference (`saharun/01.jpg`):

- Aerial or wide landscape shots of the bay, coast, sea, cliffs, forests
- Turquoise water, beaches, islands, coves — the location itself
- Minimal or no people, sunbeds, umbrellas, boats in the foreground
- No maps, diagrams, buildings as the main subject, or tourist snapshots

**Good:** drone view of a beach and pine forest, empty cove at golden hour, cliffs and open sea.

**Avoid:** beach with umbrellas and crowds, harbour close-ups with ferries, historical maps, low-quality Wikimedia tourist photos.

## Supported formats

Use `.jpg`, `.jpeg`, `.webp`, or `.png`. Prefer **landscape** photos (roughly 16:10 or 4:3), at least ~1200px wide.

## Enable images on the map

1. Add `01.jpg`, `02.jpg`, `03.jpg` to `public/destinations/{slug}/`
2. In `src/data/archipelago-locations.ts`, set:

```ts
import { destinationCoverImages } from "@/data/archipelago-locations";

coverImages: destinationCoverImages("telascica"),
```

For a single image (until you add more), list paths explicitly:

```ts
coverImages: ["/destinations/saharun/01.jpg"],
```

3. Add attribution in [IMAGE_CREDITS.md](./IMAGE_CREDITS.md)

## Destinations

| Slug | Name |
|------|------|
| `telascica` | NP Telašćica |
| `kornati` | NP Kornati |
| `saharun` | Sakarun |
| `potopljeni-brod` | Potopljeni brod (Veli Rat) |
| `titove-spilje` | Titove špilje |
| `golubinka` | Golubinka |
| `vodenjak` | Vodenjak |
| `olib` | Olib |
| `silba` | Silba |
| `lazaret-osljak` | Lazaret (Ošljak) |
| `kostanj` | Kostanj |
| `frnaza` | Frnaža |
| `skoljic` | Školjić |
| `preko` | Preko |
| `kali` | Kali |
| `muline` | Muline |
