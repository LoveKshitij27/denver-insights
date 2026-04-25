"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Insights } from "../../lib/parse";

const BUCKET_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#71717a",
];

function categorize(reason: string): string {
  const r = reason.toLowerCase();
  if (/(size|fit|small|large|tight|loose|narrow|wide)/.test(r))
    return "Sizing & Fit";
  if (
    /(defect|damag|broken|tear|stain|faulty|crack|malfunction|not.?work|quality)/.test(
      r,
    )
  )
    return "Quality Issues";
  if (
    /(not.?as.?described|different|colou?r|picture|photo|mismatch|wrong.?item|wrong.?product|wrong.?model)/.test(
      r,
    )
  )
    return "Not as Described";
  if (/(late|delay|deliver|shipping|arriv)/.test(r)) return "Delivery Issues";
  if (
    /(change.?mind|no.?longer.?need|didn.?t.?like|not.?what|unwanted|don.?t.?want)/.test(
      r,
    )
  )
    return "Changed Mind";
  if (/(price|cheap|expensive|cost)/.test(r)) return "Pricing";
  return "Other";
}

function pointOnCircle(percent: number, r = 50): [number, number] {
  const angle = 2 * Math.PI * percent - Math.PI / 2;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
}

function arcPath(startPct: number, endPct: number, r = 50): string {
  const [sx, sy] = pointOnCircle(startPct, r);
  const [ex, ey] = pointOnCircle(endPct, r);
  const largeArc = endPct - startPct > 0.5 ? 1 : 0;
  return `M 0 0 L ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey} Z`;
}

export default function DashboardPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("denver:insights");
    if (raw) {
      try {
        setInsights(JSON.parse(raw) as Insights);
      } catch {
        // ignore corrupt data
      }
    }
    setLoaded(true);
  }, []);

  const breakdown = useMemo(() => {
    if (!insights) return [];
    const counts = new Map<string, number>();
    for (const r of insights.rows) {
      const v = r.reason.trim();
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [insights]);

  const buckets = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of breakdown) {
      const bucket = categorize(r.label);
      counts.set(bucket, (counts.get(bucket) ?? 0) + r.count);
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [breakdown]);

  const insightLines = useMemo<React.ReactNode[]>(() => {
    if (buckets.length === 0) return [];
    const totalCounted = buckets.reduce((s, b) => s + b.count, 0);
    if (totalCounted === 0) return [];
    const pct = (n: number) => ((n / totalCounted) * 100).toFixed(1);
    const bm = new Map(buckets.map((b) => [b.label, b.count]));
    const out: React.ReactNode[] = [];

    const top = buckets[0];
    out.push(
      <>
        <B>{top.label}</B> is the largest return category, accounting for{" "}
        <B>{pct(top.count)}%</B> of all returns.
      </>,
    );

    const quality = bm.get("Quality Issues") ?? 0;
    if (Number(pct(quality)) > 5) {
      out.push(
        <>
          Defective items contribute about <B>{pct(quality)}%</B> of returns.
        </>,
      );
    }

    const delivery = bm.get("Delivery Issues") ?? 0;
    if (Number(pct(delivery)) > 3) {
      out.push(
        <>
          Logistics issues account for <B>{pct(delivery)}%</B>.
        </>,
      );
    }

    const sizing = bm.get("Sizing & Fit") ?? 0;
    if (Number(pct(sizing)) > 5) {
      const topSizingReason = breakdown.find((r) =>
        /size|fit|small|large|tight|loose/i.test(r.label),
      );
      if (topSizingReason) {
        out.push(
          <>
            <B>{topSizingReason.label}</B> is the leading customer-driven return
            reason at <B>{pct(topSizingReason.count)}%</B>.
          </>,
        );
      }
    }

    const changed = bm.get("Changed Mind") ?? 0;
    if (Number(pct(changed)) > 5) {
      out.push(
        <>
          <B>{pct(changed)}%</B> of returns come from buyers changing their mind
          — often preventable with clearer expectations upfront.
        </>,
      );
    }

    if (breakdown.length >= 3) {
      const top3 = breakdown.slice(0, 3).reduce((s, r) => s + r.count, 0);
      out.push(
        <>
          Top 3 raw reasons account for <B>{pct(top3)}%</B> of returns —
          focusing fixes there will move the needle most.
        </>,
      );
    }

    return out;
  }, [buckets, breakdown]);

  const recommendations = useMemo<string[]>(() => {
    if (buckets.length === 0) return [];
    const totalCounted = buckets.reduce((s, b) => s + b.count, 0);
    if (totalCounted === 0) return [];
    const pct = (n: number) => (n / totalCounted) * 100;
    const bm = new Map(buckets.map((b) => [b.label, b.count]));
    const recs: string[] = [];

    if (pct(bm.get("Quality Issues") ?? 0) > 5) {
      recs.push(
        "Audit suppliers and tighten incoming-quality inspection — recurring defects compound trust loss.",
      );
      recs.push(
        "Identify the top SKUs flagged as defective and run rapid corrective actions with manufacturers.",
      );
    }
    if (pct(bm.get("Sizing & Fit") ?? 0) > 5) {
      recs.push(
        "Publish a clearer size guide with measurements per SKU and add fit-feedback prompts on product pages.",
      );
    }
    if (pct(bm.get("Not as Described") ?? 0) > 5) {
      recs.push(
        "Audit product photography for color accuracy and tighten descriptions so the listing matches what's shipped.",
      );
    }
    if (pct(bm.get("Delivery Issues") ?? 0) > 3) {
      recs.push(
        "Review carrier performance and packaging robustness; renegotiate SLAs where transit damage clusters.",
      );
    }
    if (pct(bm.get("Changed Mind") ?? 0) > 5) {
      recs.push(
        "Improve product detail pages with better specs, sizing notes, and demos to set expectations earlier in the funnel.",
      );
    }
    if (pct(bm.get("Pricing") ?? 0) > 3) {
      recs.push(
        "Run a competitive price scan on SKUs with pricing-related returns; consider price-match guarantees.",
      );
    }
    if (recs.length === 0) {
      recs.push(
        "Returns are spread evenly across buckets — no single category dominates. Track this distribution over time to spot drift early.",
      );
    }
    return recs;
  }, [buckets]);

  if (loaded && !insights) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
            No data yet
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Upload a file on the access page to see insights.
          </p>
          <Link
            href="/access"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Go to upload
          </Link>
        </div>
      </div>
    );
  }

  if (!insights) {
    return <div className="flex-1 bg-zinc-50 dark:bg-black" />;
  }

  const totalReturns = insights.rowCount;
  const topReason = breakdown[0]?.label ?? null;
  const reasons = breakdown.slice(0, 10);
  const max = reasons.length > 0 ? Math.max(...reasons.map((r) => r.count)) : 0;
  const total = reasons.reduce((s, r) => s + r.count, 0);

  return (
    <div className="flex-1 bg-zinc-50 px-6 py-10 font-sans dark:bg-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Return Orders Insights
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Gain visibility into customer return behavior
          </p>
        </div>

        <p className="mb-8 text-xs text-zinc-500 dark:text-zinc-400">
          Source: <span className="font-medium">{insights.fileName}</span> ·{" "}
          {insights.rowCount.toLocaleString()} rows
          {insights.reasonColumn && (
            <>
              {" "}
              · Reason column:{" "}
              <span className="font-medium">{insights.reasonColumn}</span>
            </>
          )}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KpiCard
            label="Total Returns"
            value={totalReturns.toLocaleString()}
          />
          <KpiCard
            label="Top Return Reason"
            value={topReason ?? "N/A"}
            hint={
              topReason === null
                ? "no return-reason column detected"
                : undefined
            }
          />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-lg font-semibold text-black dark:text-zinc-50">
            Return Reasons Breakdown
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Count and share of returns
          </div>

          {reasons.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No return-reason column detected. Add a column named something
              like &quot;return_reason&quot; or &quot;reason&quot; to see this
              chart.
            </div>
          ) : (
            <div className="mt-8 pt-6">
              <div className="flex h-64 items-end gap-3">
                {reasons.map((r) => {
                  const h = max > 0 ? (r.count / max) * 100 : 0;
                  const pct =
                    total > 0 ? ((r.count / total) * 100).toFixed(1) : "0";
                  return (
                    <div key={r.label} className="relative h-full flex-1">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t bg-blue-500 transition-all dark:bg-blue-400"
                        style={{ height: `${h}%` }}
                      />
                      <div
                        className="absolute left-0 right-0 text-center text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        style={{ bottom: `${h}%`, paddingBottom: "6px" }}
                      >
                        {r.count}
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {" "}
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                {reasons.map((r) => (
                  <div
                    key={r.label}
                    className="flex-1 truncate text-center text-xs text-zinc-700 dark:text-zinc-300"
                    title={r.label}
                  >
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-lg font-semibold text-black dark:text-zinc-50">
            Category Grouping
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Raw reasons grouped into business buckets
          </div>

          {buckets.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              Need a return-reason column to compute categories.
            </div>
          ) : (
            <PieChart buckets={buckets} />
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-lg font-semibold text-black dark:text-zinc-50">
            Insights
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Auto-generated highlights from your data
          </div>
          {insightLines.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-zinc-300 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No insights — upload a file with a return-reason column.
            </div>
          ) : (
            <ul className="mt-6 space-y-3">
              {insightLines.map((node, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                    aria-hidden
                  />
                  <span>{node}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-lg font-semibold text-black dark:text-zinc-50">
            Actionable Recommendations
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Suggested next steps based on the insights above
          </div>
          {recommendations.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-zinc-300 px-6 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              No recommendations available.
            </div>
          ) : (
            <ul className="mt-6 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300 marker:text-zinc-400">
              {recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function B({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </strong>
  );
}

function PieChart({ buckets }: { buckets: { label: string; count: number }[] }) {
  const total = buckets.reduce((s, b) => s + b.count, 0);
  let cursor = 0;
  const slices = buckets.map((b, i) => {
    const start = cursor;
    const share = total > 0 ? b.count / total : 0;
    cursor += share;
    return {
      ...b,
      start,
      end: cursor,
      share,
      color: BUCKET_COLORS[i % BUCKET_COLORS.length],
    };
  });

  return (
    <div className="mt-6 flex flex-wrap items-center gap-8">
      <svg
        viewBox="-52 -52 104 104"
        className="h-56 w-56 shrink-0"
        role="img"
        aria-label="Return reasons by category"
      >
        {slices.length === 1 ? (
          <circle r={50} fill={slices[0].color} />
        ) : (
          slices.map((s) => (
            <path
              key={s.label}
              d={arcPath(s.start, s.end)}
              fill={s.color}
              stroke="white"
              strokeWidth={1}
            />
          ))
        )}
      </svg>
      <ul className="flex min-w-[220px] flex-1 flex-col gap-2">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <span className="flex-1 text-zinc-900 dark:text-zinc-100">
              {s.label}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{s.count}</span>
            <span className="w-14 text-right text-zinc-500 dark:text-zinc-400">
              {(s.share * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </div>
      )}
    </div>
  );
}
