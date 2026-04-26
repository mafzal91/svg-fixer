export type ExpandProps = "start" | "end" | "none";
export type ExportType = "default" | "named";
export type JsxRuntime = "classic" | "automatic";

export interface SvgrSettings {
  componentName: string;
  typescript: boolean;
  memo: boolean;
  forwardRef: boolean;
  titleProp: boolean;
  expandProps: ExpandProps;
  jsxRuntime: JsxRuntime;
  exportType: ExportType;
  icon: boolean;
  dimensions: boolean;
}

export const defaultSvgrSettings: SvgrSettings = {
  componentName: "SvgIcon",
  typescript: false,
  memo: false,
  forwardRef: false,
  titleProp: false,
  expandProps: "end",
  jsxRuntime: "classic",
  exportType: "default",
  icon: false,
  dimensions: true,
};

const JSX_ATTR_MAP: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  usemap: "useMap",
  frameborder: "frameBorder",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  "xlink:href": "xlinkHref",
  "xmlns:xlink": "xmlnsXlink",
  "xml:space": "xmlSpace",
  "xml:lang": "xmlLang",
};

function toJsxAttrName(attr: string): string {
  if (JSX_ATTR_MAP[attr]) return JSX_ATTR_MAP[attr];
  return attr.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

function styleStringToJsxObj(style: string): string {
  const entries = style
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const colon = decl.indexOf(":");
      if (colon === -1) return null;
      const prop = decl.slice(0, colon).trim();
      const val = decl.slice(colon + 1).trim();
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      return `${camel}: "${val}"`;
    })
    .filter(Boolean);
  return `{{ ${entries.join(", ")} }}`;
}

function nodeToJsx(
  node: Node,
  depth: number,
  isSvgRoot: boolean,
  settings: SvgrSettings,
  titleId: string,
): string {
  const pad = "  ".repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    const trimmed = text.trim();
    return trimmed ? `${pad}{${JSON.stringify(trimmed)}}\n` : "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  const attrParts: string[] = [];

  for (const { name, value } of el.attributes) {
    if (isSvgRoot) {
      if (name === "width" || name === "height") {
        if (!settings.dimensions && !settings.icon) continue;
        if (settings.icon) {
          attrParts.push(`${toJsxAttrName(name)}="1em"`);
          continue;
        }
      }
    }

    const jsxName = toJsxAttrName(name);
    if (jsxName === "style") {
      attrParts.push(`style={${styleStringToJsxObj(value)}}`);
    } else if (value === "") {
      attrParts.push(jsxName);
    } else {
      attrParts.push(`${jsxName}="${value}"`);
    }
  }

  if (isSvgRoot && settings.forwardRef) {
    attrParts.push("ref={ref}");
  }

  if (isSvgRoot && settings.expandProps === "start") {
    attrParts.unshift("{...props}");
  } else if (isSvgRoot && settings.expandProps === "end") {
    attrParts.push("{...props}");
  }

  const childNodes = Array.from(node.childNodes);
  const childLines: string[] = [];

  if (isSvgRoot && settings.titleProp) {
    childLines.push(
      `${pad}  {title ? <title id="${titleId}">{title}</title> : null}\n`,
    );
  }

  for (const child of childNodes) {
    childLines.push(nodeToJsx(child, depth + 1, false, settings, titleId));
  }

  const filteredChildren = childLines.filter(Boolean);
  const attrsStr = attrParts.length ? " " + attrParts.join(" ") : "";

  if (filteredChildren.length === 0) {
    return `${pad}<${tag}${attrsStr} />\n`;
  }

  return `${pad}<${tag}${attrsStr}\n${pad}>\n${filteredChildren.join("")}${pad}</${tag}>\n`;
}

function buildJsxBody(svgString: string, settings: SvgrSettings): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl = doc.documentElement;

  const titleId = "title";

  if (settings.titleProp) {
    const existing = svgEl.getAttribute("aria-labelledby");
    if (!existing) {
      svgEl.setAttribute("aria-labelledby", titleId);
    }
  }

  const jsxLines: string[] = [];
  jsxLines.push(
    nodeToJsx(svgEl, 2, true, settings, titleId),
  );

  return jsxLines.join("").trimEnd();
}

export function svgToComponent(svgString: string, settings: SvgrSettings): string {
  const ts = settings.typescript;
  const name = settings.componentName || "SvgIcon";
  const lines: string[] = [];

  // Imports
  if (settings.jsxRuntime === "classic") {
    lines.push(`import * as React from "react";`);
    lines.push("");
  }

  // Props type
  const svgPropsType = ts
    ? `React.SVGProps<SVGSVGElement>${settings.titleProp ? " & { title?: string; titleId?: string }" : ""}`
    : null;

  // Component signature
  let propsParam = "props";
  if (ts && svgPropsType) {
    propsParam = `props: ${svgPropsType}`;
  }

  let destructure = "";
  if (settings.titleProp) {
    if (ts) {
      destructure = `const { title, titleId, ...props } = ${settings.typescript ? `props as { title?: string; titleId?: string } & React.SVGProps<SVGSVGElement>` : "props"};`;
    } else {
      destructure = `const { title, titleId, ...props } = props;`;
    }
  }

  const jsxBody = buildJsxBody(svgString, settings);

  if (settings.forwardRef) {
    const refType = ts ? `React.Ref<SVGSVGElement>` : "";
    const refParam = ts ? `ref: ${refType}` : "ref";
    const innerFnParams = settings.titleProp
      ? ts
        ? `(${propsParam}, ${refParam})`
        : "(props, ref)"
      : ts
        ? `(${propsParam}, ${refParam})`
        : "(props, ref)";

    const refTypeArgs = ts ? `<SVGSVGElement, ${svgPropsType}>` : "";

    lines.push(`const ${name} = React.forwardRef${refTypeArgs}(${innerFnParams} => {`);
    if (destructure) lines.push(`  ${destructure}`);
    lines.push(`  return (`);
    lines.push(jsxBody);
    lines.push(`  );`);
    lines.push(`});`);
    lines.push(`${name}.displayName = "${name}";`);
  } else {
    const fnParams = settings.titleProp
      ? ts
        ? `({ title, titleId, ...props }${svgPropsType ? `: ${svgPropsType}` : ""})`
        : "({ title, titleId, ...props })"
      : ts
        ? `(props${svgPropsType ? `: ${svgPropsType}` : ""})`
        : "(props)";

    lines.push(`const ${name} = ${fnParams}${ts ? ": React.ReactElement" : ""} => (`);
    lines.push(jsxBody);
    lines.push(`);`);
  }

  lines.push("");

  if (settings.memo) {
    const memoName = `Memo${name}`;
    lines.push(`const ${memoName} = React.memo(${name});`);
    lines.push("");
    if (settings.exportType === "default") {
      lines.push(`export default ${memoName};`);
    } else {
      lines.push(`export { ${memoName} as ${name} };`);
    }
  } else {
    if (settings.exportType === "default") {
      lines.push(`export default ${name};`);
    } else {
      lines.push(`export { ${name} };`);
    }
  }

  return lines.join("\n");
}
