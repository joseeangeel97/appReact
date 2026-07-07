export function readString(value, { maxLength, normalize } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  const text = value.trim();

  if (maxLength && text.length > maxLength) {
    return '';
  }

  return normalize ? normalize(text) : text;
}

export function readInteger(value, { min, max } = {}) {
  const rawValue =
    typeof value === 'number' || typeof value === 'string' ? value : '';
  const rawText = String(rawValue).trim();

  if (!/^\d+$/.test(rawText)) {
    return {
      rawText,
      number: Number.NaN,
    };
  }

  const number = Number(rawText);

  if (!Number.isSafeInteger(number) || number < min || number > max) {
    return {
      rawText,
      number: Number.NaN,
    };
  }

  return {
    rawText,
    number,
  };
}

export function readImageSelection(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const selectedImage = {
    id: readString(value.id, { maxLength: 120 }),
    label: readString(value.label, { maxLength: 160 }),
    category: readString(value.category, { maxLength: 80 }),
    description: readString(value.description, { maxLength: 500 }),
    src: readString(value.src, { maxLength: 1200 }),
    originalSrc: readString(value.originalSrc, { maxLength: 1200 }),
  };

  return selectedImage.id && selectedImage.src ? selectedImage : null;
}
