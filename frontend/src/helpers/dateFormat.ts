/**
 * Formate une date en format français court
 * @param dateString - Date en string ou objet Date
 * @returns Date formatée en format français (ex: "15/06/2024")
 */
export function formatDate(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formate une date en format français long
 * @param dateString - Date en string ou objet Date
 * @returns Date formatée en format français long (ex: "15 juin 2024")
 */
export function formatDateLong(dateString?: string | Date): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
