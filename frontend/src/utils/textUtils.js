export function truncateText(text, maxLength) {
  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }

  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}