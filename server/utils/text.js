// Convierte textos de acceso a una forma comparable: sin acentos y en minúsculas.
export function normalizeProfileText(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
