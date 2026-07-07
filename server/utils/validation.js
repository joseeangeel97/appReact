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
