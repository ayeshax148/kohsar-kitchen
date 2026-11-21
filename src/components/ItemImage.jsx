import { useState } from 'react';

// Shows a labelled fallback when a dish has no photo or the file fails to load.
export default function ItemImage({ src, alt, name, className = '' }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`item-image image-fallback ${className}`} role="img" aria-label={`No photo yet for ${name}`}>
        <span aria-hidden="true">Photo coming soon</span>
      </div>
    );
  }
  return (
    <img
      className={`item-image ${className}`}
      src={src}
      alt={alt || name}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
