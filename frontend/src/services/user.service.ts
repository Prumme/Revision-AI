import { ApiService } from "./api.service";
import type { Invoice } from "@/types/invoice";

export async function getUserInvoices(customerId: string): Promise<Invoice[]> {
    const response = await ApiService.get<{ invoices: Invoice[] }>(
        `/subscription/invoices/${customerId}`,
    );
    return response.data?.invoices || [];
}


