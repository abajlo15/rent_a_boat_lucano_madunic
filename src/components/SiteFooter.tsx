export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-700">Rent a Boat Zadar</p>
        <p>
          Modern fleet experiences with half-day and full-day tours, with or
          without skipper.
        </p>
        <p>Contact details and real photos will be added in the next update.</p>
        <p className="text-xs text-slate-400">
          Map data ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
          >
            OpenStreetMap
          </a>{" "}
          contributors · ©{" "}
          <a
            href="https://carto.com/attributions"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
          >
            CARTO
          </a>{" "}
          ·{" "}
          <a
            href="https://maplibre.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-slate-300 underline-offset-2 hover:text-slate-600"
          >
            MapLibre
          </a>
        </p>
      </div>
    </footer>
  );
}
