<script setup lang="ts">
import { Download } from "lucide-vue-next";
import type { Invoice } from "@/types/invoice";
import { Newspaper } from 'lucide-vue-next';

const props = defineProps<{
  invoices: Invoice[];
  scrollable?: boolean;
}>();
</script>

<template>
  <div v-if="props.invoices.length > 0">
    <label class="block text-sm font-medium text-gray-500 mb-3">
      Factures ({{ props.invoices.length }})
    </label>
    <div :class="['divide-y divide-gray-200', props.scrollable !== false ? 'max-h-32 overflow-y-scroll' : '']">
      <div
        v-for="invoice in props.invoices"
        :key="invoice.id"
        class="flex items-center justify-between py-4"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-gray-900 truncate">
              Facture #{{ invoice.number || invoice.id }}
            </p>
            <p class="text-sm font-medium text-gray-900">
              {{ (invoice.total / 100).toFixed(2) }} {{ invoice.currency.toUpperCase() }}
            </p>
          </div>
          <p class="mt-1 text-sm text-gray-500">
            {{ new Date(invoice.created * 1000).toLocaleDateString("fr-FR") }}
          </p>
        </div>
        <a
          v-if="invoice.invoice_pdf"
          :href="invoice.invoice_pdf"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-500 hover:text-gray-700 ml-4"
        >
          <Download class="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>

  <div class="px-6 py-12 text-center text-gray-500" v-else>
    <Newspaper class="w-12 h-12 mx-auto mb-4 text-gray-400" />
    <p>Aucune facture disponible.</p>
  </div>
</template>
