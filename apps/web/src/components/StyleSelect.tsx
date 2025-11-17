const STYLES = ['Avant-garde', 'Streetwear', 'Minimalist', 'Formal', 'Retro'] as const;

type StyleSelectProps = {
  value: string;
  onChange: (value: (typeof STYLES)[number]) => void;
  disabled?: boolean;
};

export const StyleSelect = ({ value, onChange, disabled }: StyleSelectProps) => (
  <div>
    <label htmlFor="style" className="block text-sm font-medium text-slate-700">
      Style
    </label>
    <select
      id="style"
      name="style"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as (typeof STYLES)[number])}
      className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      {STYLES.map((styleOption) => (
        <option key={styleOption} value={styleOption}>
          {styleOption}
        </option>
      ))}
    </select>
  </div>
);

