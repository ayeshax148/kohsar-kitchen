// Shared loading, error and empty-state blocks so every page reports status the same way.

export function LoadingState({ label = 'Loading today’s menu…' }) {
  return (
    <div className="status-box" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title = 'We couldn’t load the menu', message, onRetry }) {
  return (
    <div className="status-box status-error" role="alert">
      <h2>{title}</h2>
      {message && <p>{message}</p>}
      <p>Your saved order is safe. Check your connection and try again.</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, actions }) {
  return (
    <div className="status-box status-empty">
      <h2>{title}</h2>
      {children}
      {actions && <div className="actions-row">{actions}</div>}
    </div>
  );
}
