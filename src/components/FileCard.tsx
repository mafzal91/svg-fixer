import { useMemo, useState } from "react";
import { type SvgrSettings, svgToComponent } from "../svgr-transform";
import { type ProcessedFile } from "../types";
import { componentName, downloadText, formatBytes, outputName } from "../utils";

type OutputTab = "svg" | "component";

export function FileCard({
  file,
  svgrSettings,
  onRemove,
}: {
  file: ProcessedFile;
  svgrSettings: SvgrSettings;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<OutputTab>("svg");

  const savedBytes = file.originalBytes - file.optimizedBytes;
  const savedPct = file.originalBytes > 0 ? (savedBytes / file.originalBytes) * 100 : 0;

  const resolvedSettings = useMemo<SvgrSettings>(() => {
    const name = svgrSettings.componentName.trim() || componentName(file.name);
    return { ...svgrSettings, componentName: name };
  }, [svgrSettings, file.name]);

  const componentCode = useMemo(() => {
    if (file.error || !file.optimized) return "";
    try {
      return svgToComponent(file.optimized, resolvedSettings);
    } catch {
      return "// Error generating component";
    }
  }, [file.optimized, file.error, resolvedSettings]);

  const activeContent = tab === "svg" ? file.optimized : componentCode;
  const ext = resolvedSettings.typescript ? "tsx" : "jsx";
  const downloadFilename =
    tab === "svg" ? outputName(file.name) : `${resolvedSettings.componentName}.${ext}`;

  const copy = async () => {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <li className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{file.name}</span>
          {file.error ? (
            <span className="text-xs text-red-400">Error: {file.error}</span>
          ) : (
            <span className="text-xs text-neutral-400">
              {formatBytes(file.originalBytes)} → {formatBytes(file.optimizedBytes)}{" "}
              <span className="text-emerald-400">
                (−{formatBytes(savedBytes)}, {savedPct.toFixed(1)}%)
              </span>
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {!file.error && (
            <>
              <button
                type="button"
                onClick={copy}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:bg-neutral-800"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => downloadText(downloadFilename, activeContent, tab === "svg" ? "image/svg+xml" : "text/plain")}
                className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400"
              >
                Download
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove"
            className="rounded-md border border-neutral-800 px-2 py-1.5 text-xs text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          >
            ✕
          </button>
        </div>
      </div>

      {!file.error && (
        <div className="grid gap-px bg-neutral-800 md:grid-cols-2">
          <Preview label="Before" svg={file.original} />
          <Preview label="After" svg={file.optimized} />
          <div className="bg-neutral-950 md:col-span-2">
            <div className="flex border-b border-neutral-800">
              <TabButton active={tab === "svg"} onClick={() => setTab("svg")}>SVG output</TabButton>
              <TabButton active={tab === "component"} onClick={() => setTab("component")}>React component</TabButton>
            </div>
            <div className="p-4">
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-neutral-900 p-3 text-xs text-neutral-200">
                <code>{activeContent}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-medium transition ${
        active ? "border-b-2 border-indigo-400 text-indigo-300" : "text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function Preview({ label, svg }: { label: string; svg: string }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-2 bg-neutral-950 p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <div
        className="flex h-40 w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-md bg-[repeating-conic-gradient(#1f1f1f_0%_25%,#141414_0%_50%)] [background-size:16px_16px] p-3 text-neutral-100 [&>svg]:h-auto [&>svg]:w-auto [&>svg]:min-h-0 [&>svg]:min-w-0 [&>svg]:max-h-full [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
