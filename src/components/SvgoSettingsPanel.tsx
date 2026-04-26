import { type SvgoSettings } from "../svgo-config";
import { CollapsiblePanel, Toggle } from "./ui";

export function SvgoSettingsPanel({
  settings,
  onChange,
}: {
  settings: SvgoSettings;
  onChange: (s: SvgoSettings) => void;
}) {
  function set<K extends keyof SvgoSettings>(key: K, value: SvgoSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <CollapsiblePanel
      icon={
        <svg className="h-4 w-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      }
      title="SVGO Settings"
      badge="optimization"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-200">Remove attributes</label>
          <p className="text-xs text-neutral-500">Comma-separated list of attributes to strip</p>
          <input
            type="text"
            value={settings.removeAttrs}
            onChange={(e) => set("removeAttrs", e.target.value)}
            placeholder="fill, stroke, …"
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-4 sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Icon transforms</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Toggle
              label="Add fill=&quot;currentColor&quot;"
              checked={settings.addCurrentColor}
              onChange={(v) => set("addCurrentColor", v)}
              description="Makes icon color inherit from CSS"
            />
            <Toggle
              label="Add aria-hidden=&quot;true&quot;"
              checked={settings.addAriaHidden}
              onChange={(v) => set("addAriaHidden", v)}
              description="Hides decorative icons from screen readers"
            />
            <Toggle
              label="Remove dimensions"
              checked={settings.removeDimensions}
              onChange={(v) => set("removeDimensions", v)}
              description="Strip width/height for responsive sizing"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">preset-default plugins</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Toggle
              label="Remove comments"
              checked={settings.removeComments}
              onChange={(v) => set("removeComments", v)}
            />
            <Toggle
              label="Remove title"
              checked={settings.removeTitle}
              onChange={(v) => set("removeTitle", v)}
              description="Disable if title is needed for a11y"
            />
            <Toggle
              label="Convert colors"
              checked={settings.convertColors}
              onChange={(v) => set("convertColors", v)}
              description="Shorten hex/rgb color values"
            />
            <Toggle
              label="Merge paths"
              checked={settings.mergePaths}
              onChange={(v) => set("mergePaths", v)}
              description="Combine adjacent path elements"
            />
            <Toggle
              label="Collapse groups"
              checked={settings.collapseGroups}
              onChange={(v) => set("collapseGroups", v)}
              description="Flatten unnecessary &lt;g&gt; wrappers"
            />
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
