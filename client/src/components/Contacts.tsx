import { useState } from "react";
import type { Contact, ContactStatus } from "../types";
import { api } from "../api";
import Modal from "./Modal";

const STATUSES: ContactStatus[] = ["Lead", "Qualified", "Customer", "Churned"];

const statusStyles: Record<ContactStatus, string> = {
  Lead: "bg-slate-100 text-slate-700",
  Qualified: "bg-blue-100 text-blue-700",
  Customer: "bg-emerald-100 text-emerald-700",
  Churned: "bg-rose-100 text-rose-700",
};

const empty = { name: "", email: "", company: "", phone: "", status: "Lead" as ContactStatus };

export default function Contacts({
  contacts,
  onChanged,
}: {
  contacts: Contact[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setError(null);
    setOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditing(c);
    setForm({
      name: c.name,
      email: c.email ?? "",
      company: c.company ?? "",
      phone: c.phone ?? "",
      status: c.status,
    });
    setError(null);
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await api.updateContact(editing.id, form);
      } else {
        await api.createContact(form);
      }
      setOpen(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Contact) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    await api.deleteContact(c.id);
    onChanged();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
          <p className="text-slate-500">{contacts.length} people in your CRM.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + New contact
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No contacts yet. Add your first one!
                </td>
              </tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-400">{c.phone}</div>
                </td>
                <td className="px-5 py-3 text-slate-600">{c.company || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{c.email || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => openEdit(c)}
                    className="mr-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="text-sm font-medium text-rose-600 hover:text-rose-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? "Edit contact" : "New contact"} onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Field label="Name">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Company">
              <input
                className="input"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Inc."
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@acme.com"
              />
            </Field>
            <Field label="Phone">
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 000 0000"
              />
            </Field>
            <Field label="Status">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ContactStatus })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
