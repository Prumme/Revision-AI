export interface Invoice {
  id: string;
  invoice_pdf: string | null;
  number: string | null;
  status: string;
  total: number;
  created: number;
  customer: string;
  currency: string;
  subtotal: number;
  total_tax_amounts: Array<{
    amount: number;
    tax_rate: string;
  }>;
  metadata: Record<string, any>;
}
