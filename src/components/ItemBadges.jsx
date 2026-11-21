import { availabilityLabel } from '../rules/availabilityRule.js';
import { DIETARY_LABELS } from '../data/business.js';

// Availability is always written out in text; colour only reinforces it.
export function AvailabilityBadge({ item }) {
  const tone = item.stock <= 0 ? 'badge-out' : item.stock <= 3 ? 'badge-low' : 'badge-ok';
  return <span className={`badge ${tone}`}>{availabilityLabel(item)}</span>;
}

export function PickupOnlyBadge({ item }) {
  if (!item.pickupOnly) return null;
  return <span className="badge badge-pickup">Pickup only</span>;
}

export function DietaryTags({ dietary }) {
  if (!dietary.length) return null;
  return (
    <ul className="tag-list" aria-label="Dietary information">
      {dietary.map((tag) => (
        <li key={tag} className="tag">{DIETARY_LABELS[tag]}</li>
      ))}
    </ul>
  );
}
