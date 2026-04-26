import type { Config } from "svgo";

export interface SvgoSettings {
  // Icon-specific transforms
  removeAttrs: string;      // comma-separated attrs to strip, e.g. "fill,stroke"
  addCurrentColor: boolean; // add fill="currentColor" to root <svg>
  addAriaHidden: boolean;   // add aria-hidden="true" to root <svg>
  removeDimensions: boolean;

  // preset-default overrides
  removeComments: boolean;
  removeTitle: boolean;
  convertColors: boolean;
  mergePaths: boolean;
  collapseGroups: boolean;
}

export const defaultSvgoSettings: SvgoSettings = {
  removeAttrs: "fill",
  addCurrentColor: true,
  addAriaHidden: true,
  removeDimensions: true,
  removeComments: true,
  removeTitle: true,
  convertColors: true,
  mergePaths: true,
  collapseGroups: true,
};

export function buildSvgoConfig(s: SvgoSettings): Config {
  const plugins: NonNullable<Config["plugins"]> = [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeComments: s.removeComments ? undefined : false,
          removeTitle: s.removeTitle ? undefined : false,
          convertColors: s.convertColors ? undefined : false,
          mergePaths: s.mergePaths ? undefined : false,
          collapseGroups: s.collapseGroups ? undefined : false,
        },
      },
    },
  ];

  const attrsToRemove = s.removeAttrs
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  if (attrsToRemove.length > 0) {
    plugins.push({ name: "removeAttrs", params: { attrs: attrsToRemove } });
  }

  const extraAttrs: Record<string, string> = {};
  if (s.addCurrentColor) extraAttrs["fill"] = "currentColor";
  if (s.addAriaHidden) extraAttrs["aria-hidden"] = "true";

  if (Object.keys(extraAttrs).length > 0) {
    plugins.push({
      name: "addAttributesToSVGElement",
      params: { attributes: [extraAttrs] },
    });
  }

  if (s.removeDimensions) {
    plugins.push("removeDimensions");
  }

  return { plugins };
}
