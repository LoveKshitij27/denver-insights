import WaitlistForm from "./WaitlistForm";

const painPoints = [
  'Hundreds of free-text return reasons like "leaked", "damaged", "didn\'t like it"',
  "No way to group or prioritize issues",
  "Time-consuming manual analysis",
  "Same problems repeat every month",
];

const features = [
  {
    title: "AI Clustering of Return Reasons",
    body: "Converts messy free-text into clear categories like Packaging Issues, Product Quality, and Delivery Problems.",
  },
  {
    title: "Ranked Problem List",
    body: "See issues ranked by impact so you know what's actually hurting your business.",
  },
  {
    title: "SKU-Level Insights",
    body: "Identify which products and variants are driving the most returns.",
  },
  {
    title: "Instant Dashboard",
    body: "Upload your file and get insights in minutes — no setup required.",
  },
  {
    title: "Shopify Ready",
    body: "Works with your existing Shopify returns export. No integrations needed.",
  },
];

const steps = [
  { n: "01", title: "Export", body: "Export your returns CSV from Shopify" },
  { n: "02", title: "Upload", body: "Upload your file to Denver Insights" },
  { n: "03", title: "Analyze", body: "Get a ranked breakdown of return reasons instantly" },
];

const resultPoints = [
  "41% of returns traced to one SKU",
  "Root cause identified: leaking packaging",
  "Action taken: switched courier",
];

const trustPoints = [
  "Your data is private and never shared",
  "Secure file storage and processing",
  "No access without your permission",
];

const plans = [
  {
    name: "One-Time Analysis",
    price: "₹1,499",
    description: "Perfect for a quick diagnosis",
    cta: "Analyze Now",
    featured: false,
  },
  {
    name: "Quarterly Plan",
    price: "₹4,999",
    description: "Track trends and improvements over time",
    cta: "Get Quarterly Access",
    featured: true,
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* HERO */}
      <section className="border-b border-zinc-100 bg-gradient-to-b from-blue-50/40 to-white px-6 py-24 sm:py-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-6 text-sm font-medium uppercase tracking-[0.18em] text-blue-700">
            Denver Insights
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
            Stop Guessing Why Customers Return Your Products
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 sm:text-xl">
            Upload your Shopify returns CSV and get a clear, ranked breakdown of what's actually
            broken — in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#pricing"
              className="h-12 rounded-lg bg-blue-700 px-7 text-base font-medium text-white transition hover:bg-blue-800 inline-flex items-center"
            >
              Analyze My Returns – ₹1,499
            </a>
            <a
              href="#demo"
              className="h-12 rounded-lg border border-zinc-200 bg-white px-7 text-base font-medium text-zinc-900 transition hover:border-zinc-300 inline-flex items-center"
            >
              See Sample Output
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Built for D2C founders who don't have time to read hundreds of messy return reasons.
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Returns Are Killing Your Margins — But You Don't Know Why
          </h2>
          <p className="mt-5 text-lg text-zinc-600">
            Every return has a reason — but it's buried in messy, unstructured data. Most founders
            never get a clear answer.
          </p>
          <ul className="mt-8 flex flex-col gap-3">
            {painPoints.map((p) => (
              <li key={p} className="flex gap-3 text-zinc-700">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-lg font-medium text-zinc-900">
            So you end up guessing instead of fixing.
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Meet Denver Insights
          </h2>
          <p className="mt-5 text-lg text-zinc-600">
            An AI-powered return analyzer that turns your raw CSV into clear, actionable insights.
          </p>
          <p className="mt-8 inline-block rounded-full bg-blue-700/5 px-5 py-2 text-base font-medium text-blue-700">
            One upload → one clear answer.
          </p>
        </div>
      </section>

      {/* DEMO / OUTPUT PREVIEW */}
      <section id="demo" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            What You'll See
          </h2>
          <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-blue-700">
              Top Insight
            </div>
            <p className="mt-4 text-2xl font-semibold leading-tight text-zinc-900">
              41% of your returns come from one SKU — 200ml serum
            </p>
            <p className="mt-3 text-base text-zinc-600">
              Primary issue: Packaging leaked in transit
            </p>
          </div>
          <p className="mt-8 text-lg text-zinc-700">
            Know exactly what to fix, where to act, and how much it's costing you.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Everything You Need. Nothing You Don't.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-zinc-200 bg-white p-6"
              >
                <div className="text-base font-semibold text-zinc-900">{f.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="text-sm font-mono text-blue-700">{s.n}</div>
                <div className="mt-3 text-lg font-semibold text-zinc-900">{s.title}</div>
                <p className="mt-2 text-sm text-zinc-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USER STORY */}
      <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            From Confusion to Clarity in Minutes
          </h2>
          <div className="mt-8 space-y-4 text-lg text-zinc-700">
            <p>Aarav runs a skincare D2C brand doing ₹80L/month.</p>
            <p>Last quarter, he had 312 returns and no clear reason why.</p>
            <p className="font-medium text-zinc-900">
              He uploaded his returns CSV to Denver Insights.
            </p>
          </div>
          <ul className="mt-8 flex flex-col gap-3">
            {resultPoints.map((r) => (
              <li key={r} className="flex gap-3 text-zinc-700">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-700" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-xl border-l-4 border-blue-700 bg-white px-5 py-4 text-lg font-semibold text-zinc-900">
            Returns dropped by 22% within weeks.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Simple Pricing
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {plans.map((p) => (
              <div
                key={p.name}
                className={
                  p.featured
                    ? "rounded-2xl border-2 border-blue-700 bg-white p-8 shadow-sm"
                    : "rounded-2xl border border-zinc-200 bg-white p-8"
                }
              >
                <div className="text-base font-semibold text-zinc-900">{p.name}</div>
                <div className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900">
                  {p.price}
                </div>
                <p className="mt-3 text-sm text-zinc-600">{p.description}</p>
                <a
                  href="#final-cta"
                  className={
                    p.featured
                      ? "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-medium text-white transition hover:bg-blue-800"
                      : "mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition hover:border-zinc-300"
                  }
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-zinc-100 bg-zinc-50 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Your Data Is सुरक्षित
          </h2>
          <ul className="mt-10 flex flex-col gap-4 text-left">
            {trustPoints.map((t) => (
              <li
                key={t}
                className="flex gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-700"
              >
                <span aria-hidden className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-700" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="final-cta" className="px-6 py-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Stop Losing Money on Returns You Don't Understand
          </h2>
          <p className="mt-5 text-lg text-zinc-600">
            Upload your CSV and get clarity in minutes.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-blue-700 px-7 text-base font-medium text-white transition hover:bg-blue-800"
          >
            Start Analysis – ₹1,499
          </a>
          <div className="mt-12 w-full">
            <p className="mb-4 text-sm text-zinc-500">
              Or join the early-access list to hear when we open new spots.
            </p>
            <div className="flex justify-center">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-zinc-600">
            Denver Insights — Turn returns into insights.
          </div>
          <nav className="flex gap-6 text-sm text-zinc-600">
            <a href="#" className="hover:text-zinc-900">Terms of Service</a>
            <a href="#" className="hover:text-zinc-900">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-900">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
