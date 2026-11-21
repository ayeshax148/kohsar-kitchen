import { useState } from 'react';
import { useMenu } from '../context/MenuContext.jsx';
import { getDemoSettings, saveDemoSettings } from '../services/demoSettings.js';

const OPTIONS = [
  { key: 'failLoading', label: 'Simulate menu loading failure' },
  { key: 'emptyMenu', label: 'Simulate an empty menu (no dishes published)' },
  { key: 'availabilityChanged', label: 'Simulate availability change (Mutton Karahi 1 left, Grill Platter sold out, Kheer removed)' },
];

// Clearly labelled testing panel required by the brief (loading failure + changed availability).
export default function DemoControls() {
  const { reload } = useMenu();
  const [settings, setSettings] = useState(getDemoSettings);

  function handleToggle(event) {
    const { name, checked } = event.target;
    const next = { ...settings, [name]: checked };
    setSettings(next);
    saveDemoSettings(next);
    reload(); // reload the menu so the change is visible immediately
  }

  return (
    <details className="demo-controls">
      <summary>Demo controls (testing only)</summary>
      <fieldset>
        <legend>These switches change how the mock menu loader behaves. They are saved in this browser.</legend>
        {OPTIONS.map(({ key, label }) => (
          <label key={key} className="check">
            <input type="checkbox" name={key} checked={settings[key]} onChange={handleToggle} />
            {label}
          </label>
        ))}
      </fieldset>
    </details>
  );
}
