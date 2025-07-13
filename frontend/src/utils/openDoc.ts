export function openDoc(url: string) {
  const apiURL = import.meta.env.VITE_API_URL;
  const docURL = `${apiURL}${url}`;
  window.open(docURL, "_blank");
}
