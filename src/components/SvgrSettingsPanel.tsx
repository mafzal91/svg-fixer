import { type SvgrSettings } from "../svgr-transform";
import { CollapsiblePanel, Select, Toggle } from "./ui";

export function SvgrSettingsPanel({
  settings,
  onChange,
}: {
  settings: SvgrSettings;
  onChange: (s: SvgrSettings) => void;
}) {
  function set<K extends keyof SvgrSettings>(key: K, value: SvgrSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <CollapsiblePanel
      icon={
        <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      }
      title="SVGR Settings"
      badge="React component output"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-200">Component name</label>
          <p className="text-xs text-neutral-500">Leave blank to derive from file name</p>
          <input
            type="text"
            placeholder="auto (from filename)"
            value={settings.componentName}
            onChange={(e) => set("componentName", e.target.value)}
            className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200 placeholder-neutral-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <Select
          label="Export type"
          value={settings.exportType}
          options={[
            { value: "default", label: "Default export" },
            { value: "named", label: "Named export" },
          ]}
          onChange={(v) => set("exportType", v)}
        />

        <Select
          label="JSX runtime"
          value={settings.jsxRuntime}
          options={[
            { value: "classic", label: "Classic (import React)" },
            { value: "automatic", label: "Automatic (no import)" },
          ]}
          onChange={(v) => set("jsxRuntime", v)}
          description="Automatic requires React 17+ / new JSX transform"
        />

        <Select
          label="Expand props"
          value={settings.expandProps}
          options={[
            { value: "end", label: "Spread at end" },
            { value: "start", label: "Spread at start" },
            { value: "none", label: "No prop spreading" },
          ]}
          onChange={(v) => set("expandProps", v)}
          description="Position of {...props} on the SVG element"
        />

        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle
              label="TypeScript"
              checked={settings.typescript}
              onChange={(v) => set("typescript", v)}
              description="Add type annotations (.tsx output)"
            />
            <Toggle
              label="Forward ref"
              checked={settings.forwardRef}
              onChange={(v) => set("forwardRef", v)}
              description="Wrap with React.forwardRef"
            />
            <Toggle
              label="Memo"
              checked={settings.memo}
              onChange={(v) => set("memo", v)}
              description="Wrap with React.memo"
            />
            <Toggle
              label="Title prop"
              checked={settings.titleProp}
              onChange={(v) => set("titleProp", v)}
              description="Add accessible title prop"
            />
            <Toggle
              label="Icon mode"
              checked={settings.icon}
              onChange={(v) => set("icon", v)}
              description="Set width/height to 1em"
            />
            <Toggle
              label="Preserve dimensions"
              checked={settings.dimensions}
              onChange={(v) => set("dimensions", v)}
              description="Keep width/height attributes"
            />
          </div>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
