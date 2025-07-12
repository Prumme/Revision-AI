// Configuration des couleurs pour les catégories de quiz
export const categoryColors = {
  general_history: "#e5d5f7",
  sciences: "#cce4f6",
  geography: "#daf5e2",
  literature: "#fdf4cc",
  arts: "#f9d0d0",
  sports: "#e5d5f7",
  mathematics: "#ffe4e1",
  default: "#e5e5e5",
};

// Labels français pour les catégories
export const categoryLabels: Record<string, string> = {
  general_history: "Histoire générale",
  sciences: "Sciences",
  geography: "Géographie",
  mathematics: "Mathématiques",
  literature: "Littérature",
  arts: "Arts",
  sports: "Sports",
  "": "Non classé",
};

/**
 * Convertit une couleur hexadécimale en RGBA
 * @param hex - Couleur au format hexadécimal (ex: "#e5d5f7")
 * @param alpha - Valeur alpha entre 0 et 1
 * @returns Couleur au format RGBA
 */
function hexToRgba(hex: string, alpha: number): string {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Retourne la couleur associée à une catégorie de quiz
 * @param category - Nom de la catégorie
 * @param alpha - Opacité de la couleur (par défaut 0.6)
 * @returns Couleur RGBA pour la catégorie
 */
export function getCategoryColor(category?: string, alpha: number = 0.6): string {
  const baseColor =
    categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  return hexToRgba(baseColor, alpha);
}

/**
 * Retourne le label français d'une catégorie de quiz
 * @param category - Nom de la catégorie en anglais
 * @returns Label français de la catégorie
 */
export function getCategoryLabel(category?: string): string {
  return categoryLabels[category || ""] || category || "Non classé";
}
