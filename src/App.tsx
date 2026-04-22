import { useCallback, useMemo, useRef, useState } from "react";
import { optimize } from "svgo";
import { svgoConfig } from "./svgo-config";

type ProcessedFile = {
  name: string;
  original: string;
  optimized: string;
  originalBytes: number;
  optimizedBytes: number;
  error?: string;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function optimizeSvg(name: string, source: string): ProcessedFile {
  const originalBytes = new Blob([source]).size;
  try {
    const result = optimize(source, { path: name, ...svgoConfig });
    const optimized = result.data;
    return {
      name,
      original: source,
      optimized,
      originalBytes,
      optimizedBytes: new Blob([optimized]).size,
    };
  } catch (err) {
    return {
      name,
      original: source,
      optimized: "",
      originalBytes,
      optimizedBytes: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function downloadText(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function outputName(name: string): string {
  if (name.toLowerCase().endsWith(".svg")) {
    return `${name.slice(0, -4)}.optimized.svg`;
  }
  return `${name}.optimized.svg`;
}

export default function App() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter(
      (f) => f.type === "image/svg+xml" || f.name.toLowerCase().endsWith(".svg"),
    );
    if (incoming.length === 0) return;

    const processed = await Promise.all(
      incoming.map(async (file) => {
        const text = await file.text();
        return optimizeSvg(file.name, text);
      }),
    );
    setFiles((prev) => [...processed, ...prev]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) {
        void handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const totals = useMemo(() => {
    const original = files.reduce((acc, f) => acc + f.originalBytes, 0);
    const optimized = files.reduce((acc, f) => acc + f.optimizedBytes, 0);
    const saved = original - optimized;
    const pct = original > 0 ? (saved / original) * 100 : 0;
    return { original, optimized, saved, pct };
  }, [files]);

  const downloadAll = () => {
    for (const f of files) {
      if (!f.error) downloadText(outputName(f.name), f.optimized);
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">SVG Fixer</h1>
        <p className="text-neutral-400">
          Drop SVG icons and get them optimized with SVGO. Hardcoded{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm">
            fill
          </code>{" "}
          removed, <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm">
            fill="currentColor"
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-sm">
            aria-hidden="true"
          </code>{" "}
          added, and dimensions stripped for responsive sizing. Everything runs
          locally in your browser.
        </p>
      </header>

      <label
        htmlFor="svg-input"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center transition ${
          isDragging
            ? "border-indigo-400 bg-indigo-500/10"
            : "border-neutral-700 bg-neutral-900 hover:border-neutral-500 hover:bg-neutral-900/60"
        }`}
      >
        <svg
          className="h-10 w-10 text-neutral-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
          <path d="M20 16.5V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.5" />
        </svg>
        <div className="text-base font-medium">
          Drop SVG files here, or click to select
        </div>
        <div className="text-sm text-neutral-500">
          Multiple files supported · processed locally
        </div>
        <input
          ref={inputRef}
          id="svg-input"
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl bg-neutral-900 px-5 py-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-neutral-300">
              <span>
                <span className="text-neutral-500">Files:</span> {files.length}
              </span>
              <span>
                <span className="text-neutral-500">Original:</span>{" "}
                {formatBytes(totals.original)}
              </span>
              <span>
                <span className="text-neutral-500">Optimized:</span>{" "}
                {formatBytes(totals.optimized)}
              </span>
              <span className="text-emerald-400">
                Saved {formatBytes(totals.saved)} ({totals.pct.toFixed(1)}%)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadAll}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Download all
              </button>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-neutral-800"
              >
                Clear
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-4">
            {files.map((f, idx) => (
              <FileCard
                key={`${f.name}-${idx}`}
                file={f}
                onRemove={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-auto pt-8 text-center text-xs text-neutral-600">
        Runs SVGO in-browser · no files leave your machine
      </footer>
    </div>
  );
}

function FileCard({
  file,
  onRemove,
}: {
  file: ProcessedFile;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const savedBytes = file.originalBytes - file.optimizedBytes;
  const savedPct =
    file.originalBytes > 0 ? (savedBytes / file.originalBytes) * 100 : 0;

  const copy = async () => {
    await navigator.clipboard.writeText(file.optimized);
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
              {formatBytes(file.originalBytes)} →{" "}
              {formatBytes(file.optimizedBytes)}{" "}
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
                onClick={() => downloadText(outputName(file.name), file.optimized)}
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
          <div className="bg-neutral-950 p-4 md:col-span-2">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-neutral-900 p-3 text-xs text-neutral-200">
              <code>{file.optimized}</code>
            </pre>
          </div>
        </div>
      )}
    </li>
  );
}

function Preview({ label, svg }: { label: string; svg: string }) {
  return (
    <div className="flex min-w-0 min-h-0 flex-col gap-2 bg-neutral-950 p-4">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <div
        className="flex h-40 w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-md bg-[repeating-conic-gradient(#1f1f1f_0%_25%,#141414_0%_50%)] [background-size:16px_16px] p-3 text-neutral-100 [&>svg]:h-auto [&>svg]:w-auto [&>svg]:min-h-0 [&>svg]:min-w-0 [&>svg]:max-h-full [&>svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
