// Large tap targets (44px) for mobile. The parent owns the value (controlled component).
export default function QuantityStepper({ id, label, value, min = 1, max, onChange, disabled = false }) {
  const atMin = value <= min;
  const atMax = value >= max;

  function handleInput(event) {
    const parsed = Number.parseInt(event.target.value, 10);
    onChange(Number.isNaN(parsed) ? min : parsed);
  }

  return (
    <div className="stepper">
      <label htmlFor={id} className="visually-hidden">{label}</label>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(value - 1)}
        disabled={disabled || atMin}
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={handleInput}
        disabled={disabled}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(value + 1)}
        disabled={disabled || atMax}
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
  );
}
