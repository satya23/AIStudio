type PromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export const PromptInput = ({ value, onChange, disabled }: PromptInputProps) => (
  <div>
    <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
      Prompt
    </label>
    <textarea
      id="prompt"
      name="prompt"
      placeholder="e.g. Metallic dress inspired by celestial constellations"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      maxLength={280}
      rows={4}
      className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-70"
    />
    <p className="mt-1 text-right text-xs text-slate-400">{value.length}/280</p>
  </div>
);

