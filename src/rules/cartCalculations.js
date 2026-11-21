// Derived values for the order summary. Always computed from current state, never stored.

export function unitPrice(item, sizeId) {
  if (!item) return 0;
  const size = item.sizes?.find((s) => s.id === sizeId);
  return size ? size.price : item.price;
}

export function sizeLabel(item, sizeId) {
  return item?.sizes?.find((s) => s.id === sizeId)?.label ?? '';
}

export function countItems(lines) {
  return lines.reduce((sum, { qty }) => sum + qty, 0);
}

// Lines whose dish is missing from the current menu contribute nothing.
export function subtotalOf(lines, itemsById) {
  return lines.reduce((sum, { itemId, sizeId, qty }) => {
    const item = itemsById[itemId];
    return item ? sum + unitPrice(item, sizeId) * qty : sum;
  }, 0);
}

// Kitchen time is set by the slowest dish; delivery adds riding time.
export function estimateMinutes(lines, itemsById, mode) {
  const prep = lines.reduce((max, { itemId }) => Math.max(max, itemsById[itemId]?.prepMinutes ?? 0), 0);
  if (prep === 0) return 0;
  return mode === 'delivery' ? prep + 25 : prep;
}

export function formatPKR(amount) {
  return `Rs ${Math.round(amount).toLocaleString('en-PK')}`;
}
