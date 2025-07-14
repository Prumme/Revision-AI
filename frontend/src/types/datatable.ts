import type { PaginationData } from "@/components/ui/PaginatorComponent.vue";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  formatter?: (value: any, row: any) => string;
  render?: (value: any, row: any) => any; // Pour les composants Vue custom
}

export interface TableAction {
  label: string;
  icon?: string;
  tooltip?: string;
  variant?: "primary" | "outline" | "danger" | "warning";
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
  handler: (row: any) => void;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface TableFilter {
  key: string;
  label: string;
  type: "select" | "text";
  options?: FilterOption[];
  placeholder?: string;
}

export interface TableSort {
  column: string;
  direction: "asc" | "desc";
}

// Type générique pour les filtres
export type TableFilters = Record<string, string | number | boolean>;

export interface DataTableProps {
  data: any[];
  columns: TableColumn[];
  actions?: TableAction[];
  filters?: TableFilter[];
  initialFilters?: TableFilters;
  loading?: boolean;
  pagination?: PaginationData;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  rowKey?: string;
  itemsPerPageOptions?: FilterOption[];
}

export interface TableEmits {
  "update:search": [value: string];
  "update:filters": [filters: TableFilters];
  "update:sort": [sort: TableSort | null];
  "update:page": [page: number];
  "update:itemsPerPage": [items: number];
}
