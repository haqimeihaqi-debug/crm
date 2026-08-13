import { useCallback, useEffect, useState } from "react";
import type { Contact, Deal, Summary } from "./types";
import { api } from "./api";
import Dashboard from "./components/Dashboard";
import Contacts from "./components/Contacts";
import Deals from "./components/Deals";

type View = "dashboard" | "contacts" | "deals";

const nav: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M4 10v10h5v-6h6v6h5V10" },
  { id: "contacts", label: "Contacts", icon: "M16 14a4 4 0 10-8 0M12 7a3 3 0 100 6 3 3 0 000-6zM4 20a6 6 0 0116 0" },
  { id: "deals", label: "Deals", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" },
];

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [s, c, d] = await Promise.all([api.getSummary(), api.getContacts(), api.getDeals()]);
      setSummary(s);
      setContacts(c);
      setDeals(d);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-slate-200 bg-white p-4 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
            R
          </div>
          <span className="text-lg font-bold text-slate-800">Relay CRM</span>
        </div>
        <nav className="space-y-1">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                view === item.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-10">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {view === "dashboard" && <Dashboard summary={summary} />}
          {view === "contacts" && <Contacts contacts={contacts} onChanged={load} />}
          {view === "deals" && <Deals deals={deals} contacts={contacts} onChanged={load} />}
        </div>
      </main>
    </div>
  );
}
