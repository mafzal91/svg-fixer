import "@mcp-b/global";
import { optimize } from "svgo";
import { buildSvgoConfig, defaultSvgoSettings, type SvgoSettings } from "./svgo-config";
import { svgToComponent, defaultSvgrSettings, type SvgrSettings } from "./svgr-transform";

export function registerMcpTools() {
  if (!navigator.modelContext) return;

  navigator.modelContext.registerTool({
    name: "optimize_svg",
    description:
      "Optimize an SVG string using SVGO. Removes unnecessary attributes, adds aria-hidden and currentColor, strips dimensions, and runs preset-default plugins. Returns the optimized SVG.",
    inputSchema: {
      type: "object" as const,
      properties: {
        svg: { type: "string", description: "SVG content to optimize" },
        removeAttrs: {
          type: "string",
          description: "Comma-separated attribute names to strip (default: 'fill')",
        },
        addCurrentColor: {
          type: "boolean",
          description: "Add fill=\"currentColor\" to the root <svg> element",
        },
        addAriaHidden: {
          type: "boolean",
          description: "Add aria-hidden=\"true\" to the root <svg> element",
        },
        removeDimensions: {
          type: "boolean",
          description: "Remove width/height attributes from the root <svg>",
        },
        removeComments: { type: "boolean" },
        removeTitle: { type: "boolean" },
        convertColors: { type: "boolean" },
        mergePaths: { type: "boolean" },
        collapseGroups: { type: "boolean" },
      },
      required: ["svg"],
    },
    execute: (args) => {
      const { svg, ...overrides } = args as { svg: string } & Partial<SvgoSettings>;
      const settings: SvgoSettings = { ...defaultSvgoSettings, ...overrides };
      const result = optimize(svg, buildSvgoConfig(settings));
      return { content: [{ type: "text" as const, text: result.data }] };
    },
  });

  navigator.modelContext.registerTool({
    name: "convert_svg_to_component",
    description:
      "Convert an SVG string into a React component. Supports TypeScript, memo, forwardRef, title prop, prop spreading, and named/default exports.",
    inputSchema: {
      type: "object" as const,
      properties: {
        svg: { type: "string", description: "SVG content to convert" },
        componentName: {
          type: "string",
          description: "React component name (default: 'SvgIcon')",
        },
        typescript: { type: "boolean", description: "Emit TypeScript types" },
        memo: { type: "boolean", description: "Wrap in React.memo" },
        forwardRef: { type: "boolean", description: "Wrap in React.forwardRef" },
        titleProp: { type: "boolean", description: "Add title/titleId props for accessibility" },
        expandProps: {
          type: "string",
          enum: ["start", "end", "none"],
          description: "Where to spread extra SVG props (default: 'end')",
        },
        jsxRuntime: {
          type: "string",
          enum: ["classic", "automatic"],
          description: "JSX runtime (default: 'classic' — adds React import)",
        },
        exportType: {
          type: "string",
          enum: ["default", "named"],
          description: "Export style (default: 'default')",
        },
        icon: {
          type: "boolean",
          description: "Replace width/height with 1em for icon sizing",
        },
        dimensions: {
          type: "boolean",
          description: "Keep width/height attributes",
        },
      },
      required: ["svg"],
    },
    execute: (args) => {
      const { svg, ...overrides } = args as { svg: string } & Partial<SvgrSettings>;
      const settings: SvgrSettings = { ...defaultSvgrSettings, ...overrides };
      const component = svgToComponent(svg, settings);
      return { content: [{ type: "text" as const, text: component }] };
    },
  });
}
