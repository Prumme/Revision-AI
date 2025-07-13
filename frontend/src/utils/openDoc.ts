export function openDoc(identifier: string) {
  const apiURL = import.meta.env.VITE_API_URL;
  const docURL = `${apiURL}/view?f=${identifier}`;
  window.open(docURL, "_blank");
}
