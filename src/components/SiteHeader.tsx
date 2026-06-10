import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Rent a Boat
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Home
          </Link>
          <Link
            href="/boats"
            className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Fleet
          </Link>
          <Link
            href="/map"
            className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Map
          </Link>
          <Link
            href="/#contact"
            className="rounded-lg bg-slate-900 px-3 py-2 font-medium text-white transition hover:bg-slate-700"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
