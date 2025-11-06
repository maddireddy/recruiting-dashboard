export interface ClientContact {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary?: boolean;
}

export interface Client {
  id?: string;
  tenantId?: string;
  companyName: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  contacts: ClientContact[];
  accountManager?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}