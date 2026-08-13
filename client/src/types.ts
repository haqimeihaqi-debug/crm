export type ContactStatus = "Lead" | "Qualified" | "Customer" | "Churned";

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  status: ContactStatus;
  created_at: string;
}

export type DealStage =
  | "Prospecting"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export interface Deal {
  id: number;
  title: string;
  value: number;
  stage: DealStage;
  contact_id: number | null;
  contact_name?: string | null;
  created_at: string;
}

export interface Summary {
  contacts: number;
  customers: number;
  openDeals: number;
  pipelineValue: number;
}
