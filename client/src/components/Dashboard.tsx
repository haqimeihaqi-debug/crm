import type { Summary } from "../types";

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function Dashboard({ summary }: { summary: Summary | null }) {
  if (!summary) return <p className="text-slate-500">Loading…</p>;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Dashboard</h1>
      <p className="mb-6 text-slate-500">A quick pulse on your customer relationships.</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total contacts" value={String(summary.contacts)} accent="bg-indigo-500" />
        <StatCard label="Customers" value={String(summary.customers)} accent="bg-emerald-500" />
        <StatCard label="Open deals" value={String(summary.openDeals)} accent="bg-amber-500" />
        <StatCard label="Pipeline value" value={currency(summary.pipelineValue)} accent="bg-rose-500" />
      </div>
    </div>
  );
}
