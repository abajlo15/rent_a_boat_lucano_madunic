import Link from "next/link";
import { boats } from "@/data/boats";
import { BoatCard } from "@/components/BoatCard";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  const featuredBoats = boats.slice(0, 2);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-4 py-8 sm:px-6 lg:px-8">
      <Hero />

      <section className="grid gap-5 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            Why choose us
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Effortless days at sea
          </h2>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Flexible tours</p>
          <p className="mt-1 text-sm text-slate-600">Half-day and full-day options</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Skipper choice</p>
          <p className="mt-1 text-sm text-slate-600">With or without skipper</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Local expertise</p>
          <p className="mt-1 text-sm text-slate-600">Routes built around real local spots</p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Featured fleet
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Choose your boat
            </h2>
          </div>
          <Link
            href="/boats"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            View all boats
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredBoats.map((boat) => (
            <BoatCard key={boat.id} boat={boat} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-2xl bg-slate-900 p-6 text-white md:grid-cols-2 md:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">
            Destinations
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Discover coastline gems</h2>
          <p className="mt-4 max-w-xl text-slate-200">
            From Kornati and Telascica to Sakarun and hidden bays, every route can
            be tailored to your preferred pace and style.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {["Kornati National Park", "Nature Park Telascica", "Sakarun Beach", "Military Naval Tunnels"].map(
            (destination) => (
              <div
                key={destination}
                className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm font-medium"
              >
                {destination}
              </div>
            )
          )}
        </div>
      </section>

      <section
        id="contact"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Contact
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Let&apos;s plan your day at sea
            </h2>
            <p className="mt-4 text-slate-600">
              Tell us your preferred date and tour style. We&apos;ll send a matching
              recommendation for your group.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Note: Form submission backend will be added in next phase.
            </p>
          </div>
          <form className="grid gap-4">
            <input
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-600"
              type="text"
              placeholder="Full name"
              required
            />
            <input
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-600"
              type="email"
              placeholder="Email"
              required
            />
            <select className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-600">
              <option>Interested in...</option>
              <option>Half-day tour</option>
              <option>Full-day tour</option>
              <option>Private custom request</option>
            </select>
            <textarea
              className="min-h-28 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-600"
              placeholder="Message"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Send Inquiry
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
