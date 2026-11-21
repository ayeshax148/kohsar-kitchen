// Rule 1 (availability / capacity).
// Condition: the total quantity of one dish across all cart lines may not exceed the
// number of that dish the kitchen can still prepare today (`item.stock`). Stock 0 = sold out.

export function quantityInCart(lines, itemId, excludeLineId = null) {
  return lines
    .filter((line) => line.itemId === itemId && line.lineId !== excludeLineId)
    .reduce((sum, line) => sum + line.qty, 0);
}

// How many more of this dish may be added (or how high one line may go).
export function maxAllowedQty(item, lines, excludeLineId = null) {
  if (!item) return 0;
  return Math.max(0, item.stock - quantityInCart(lines, item.id, excludeLineId));
}

export function checkAddQuantity(item, lines, qty) {
  if (!item || item.stock <= 0) {
    return { ok: false, max: 0, message: 'Sold out for today.' };
  }
  const max = maxAllowedQty(item, lines);
  if (max === 0) {
    return { ok: false, max, message: `All ${item.stock} remaining are already in your order.` };
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return { ok: false, max, message: 'Choose a quantity of at least 1.' };
  }
  if (qty > max) {
    return { ok: false, max, message: `Only ${max} more can be added today.` };
  }
  return { ok: true, max, message: '' };
}

export function availabilityLabel(item) {
  if (item.stock <= 0) return 'Sold out today';
  if (item.stock <= 3) return `Only ${item.stock} left today`;
  return `${item.stock} available today`;
}

// Checks saved / restored cart lines against the current menu (edge case: availability changed).
// Returns one entry per affected line.
export function findCartConflicts(lines, itemsById) {
  const conflicts = [];
  const usedPerItem = {};

  lines.forEach((line) => {
    const item = itemsById[line.itemId];
    if (!item) {
      conflicts.push({ lineId: line.lineId, type: 'removed', allowedQty: 0, message: 'No longer on today’s menu.' });
      return;
    }
    if (item.stock <= 0) {
      conflicts.push({ lineId: line.lineId, type: 'soldOut', allowedQty: 0, message: 'Sold out since you added it.' });
      return;
    }
    const used = usedPerItem[item.id] ?? 0;
    const allowedQty = Math.max(0, Math.min(line.qty, item.stock - used));
    usedPerItem[item.id] = used + allowedQty;
    if (allowedQty < line.qty) {
      conflicts.push({
        lineId: line.lineId,
        type: 'overStock',
        allowedQty,
        message: allowedQty === 0
          ? `Only ${item.stock} left today and they are used by your other lines.`
          : `Only ${item.stock} left today. Reduce to ${allowedQty}.`,
      });
    }
  });
  return conflicts;
}

// Applies the suggested fix for every conflict without mutating the original array.
export function resolveCartConflicts(lines, itemsById) {
  const conflicts = findCartConflicts(lines, itemsById);
  const byLine = Object.fromEntries(conflicts.map((c) => [c.lineId, c]));
  return lines
    .map((line) => (byLine[line.lineId] ? { ...line, qty: byLine[line.lineId].allowedQty } : line))
    .filter((line) => line.qty > 0);
}
