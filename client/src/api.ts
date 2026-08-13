import type { Contact, Deal, Summary } from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getSummary: () => request<Summary>("/summary"),

  getContacts: () => request<Contact[]>("/contacts"),
  createContact: (data: Partial<Contact>) =>
    request<Contact>("/contacts", { method: "POST", body: JSON.stringify(data) }),
  updateContact: (id: number, data: Partial<Contact>) =>
    request<Contact>(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContact: (id: number) =>
    request<void>(`/contacts/${id}`, { method: "DELETE" }),

  getDeals: () => request<Deal[]>("/deals"),
  createDeal: (data: Partial<Deal>) =>
    request<Deal>("/deals", { method: "POST", body: JSON.stringify(data) }),
  updateDeal: (id: number, data: Partial<Deal>) =>
    request<Deal>(`/deals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDeal: (id: number) =>
    request<void>(`/deals/${id}`, { method: "DELETE" }),
};
