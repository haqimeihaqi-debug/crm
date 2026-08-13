import { useState } from "react";
import type { Contact, Deal, DealStage } from "../types";
import { api } from "../api";
import Modal from "./Modal";

const STAGES: DealStage[] = ["Prospecting", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

const stageStyles: Record<DealStage, string> = {
  Prospecting: "bg-slate-100 text-slate-700",
  Proposal: "bg-blue-100 text-blue-700",
  Negotiation: "bg-amber-100 text-amber-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-rose-100 text-rose-700",
};

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const empty = { title: "", value: "0", stage: "Prospecting" as DealStage, contact_id: "" };

export default function Deals({
  deals,
  contacts,
  onChanged,
}: {
  deals: Deal[];
  contacts: Contact[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setError(null);
    setOpen(true);
  };

  const openEdit = (d: Deal) => {
    setEditing(d);
    setForm({
      title: d.title,
      value: String(d.value),
      stage: d.stage,
      contact_id: d.contact_id ? String(d.contact_id) : "",
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      value: Number(form.value) || 0,
      stage: form.stage,
      contact_id: form.contact_id ? Number(form.contact_id) : null,
    };
    try {
      if (editing) {
        await api.updateDeal(editing.id, payload);
      } else {
        await api.createDeal(payload);
      }
      setOpen(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: Deal) => {
    if (!confirm(`Delete "${d.title}"?`)) return;
    await api.deleteDeal(d.id);
    onChanged();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Deals</h1>
          <p className="text-slate-500">{deals.length} deals in the pipeline.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + New deal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deals.length === 0 && (
          <p className="text-slate-400">No deals yet. Create one to start your pipeline!</p>
        )}
        {deals.map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="font-semibold text-slate-800">{d.title}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageStyles[d.stage]}`}>
                {d.stage}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{currency(d.value)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {d.contact_name ? `with ${d.contact_name}` : "Unassigned"}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => openEdit(d)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={() => remove(d)}
                className="text-sm font-medium text-rose-600 hover:text-rose-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <Modal title={editing ? "Edit deal" : "New deal"} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Title</span>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enterprise license"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Value (USD)</span>
              <input
                className="input"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Stage</span>
              <select
                className="input"
                value={form.stage}
                onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600">Contact</span>
              <select
                className="input"
                value={form.contact_id}
                onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
