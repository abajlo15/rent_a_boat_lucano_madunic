export function getGoogleMapsApiKey(): string | undefined {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return key?.trim() || undefined;
}

export function isGoogleMapsConfigured(): boolean {
  return Boolean(getGoogleMapsApiKey());
}

export function googleStreetViewEmbedUrl(lat: number, lng: number): string | null {
  const key = getGoogleMapsApiKey();
  if (!key) {
    return null;
  }

  const params = new URLSearchParams({
    key,
    location: `${lat},${lng}`,
    heading: "0",
    pitch: "0",
    fov: "90",
  });

  return `https://www.google.com/maps/embed/v1/streetview?${params}`;
}
