export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadText(filename: string, contents: string, mime = "image/svg+xml") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function outputName(name: string): string {
  if (name.toLowerCase().endsWith(".svg")) return `${name.slice(0, -4)}.optimized.svg`;
  return `${name}.optimized.svg`;
}

export function componentName(name: string): string {
  const base = name.replace(/\.svg$/i, "");
  return (
    base
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (_, c: string) => c.toUpperCase()) || "SvgIcon"
  );
}
