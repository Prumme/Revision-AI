// Configuration des couleurs pour les catégories de quiz
export const categoryColors = {
  general_history: "#E6B0AA", // Rouge pâle
  sciences: "#AED6F1", // Bleu clair
  geography: "#A2D9CE", // Turquoise
  literature: "#F9E79F", // Jaune pâle
  arts: "#D7BDE2", // Violet clair
  sports: "#F5B7B1", // Corail
  mathematics: "#A9CCE3", // Bleu gris
  gastronomy: "#F5CBA7", // Pêche
  informatics: "#A3E4D7", // Menthe
  daily_life: "#FAD7A0", // Orange pâle
  general_culture: "#D2B4DE", // Lavande
  geopolitics: "#F1948A", // Rouge saumon
  economy: "#85C1E9", // Bleu ciel
  technology: "#82E0AA", // Vert clair
  art: "#F8C471", // Orange doré
  music: "#BB8FCE", // Violet moyen
  cinema: "#F7DC6F", // Jaune doré
  television: "#E8DAEF", // Mauve pâle
  internet: "#73C6B6", // Turquoise moyen
  politics: "#F0B27A", // Orange terre
  society: "#B2BABB", // Gris bleuté
  philosophy: "#C39BD3", // Violet pastel
  religion: "#7FB3D5", // Bleu acier
  other: "#BFC9CA", // Gris clair
  default: "#E5E5E5", // Gris neutre
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
  gastronomy: "Gastronomie",
  informatics: "Informatique",
  daily_life: "Vie quotidienne",
  general_culture: "Culture générale",
  geopolitics: "Géopolitique",
  economy: "Économie",
  technology: "Technologie",
  art: "Art",
  music: "Musique",
  cinema: "Cinéma",
  television: "Télévision",
  internet: "Internet",
  politics: "Politique",
  society: "Société",
  philosophy: "Philosophie",
  religion: "Religion",
  other: "Autres",
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
