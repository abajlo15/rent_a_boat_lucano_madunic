import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-20 text-white md:px-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.25),_transparent_40%)]" />
      <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Rent a Boat Zadar
        </p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          Your Perfect Day on the Adriatic Starts Here
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
          Explore hidden bays, island routes, and iconic coastline spots with
          flexible half-day and full-day tours, with or without a skipper.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/boats"
            className="inline-flex min-w-44 items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
          >
            Explore Fleet
          </Link>
          <a
            href="#contact"
            className="inline-flex min-w-44 items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
          >
            Plan Your Day
          </a>
        </div>
      </div>
    </section>
  );
}
