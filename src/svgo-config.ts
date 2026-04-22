import type { Config } from "svgo";

// Mirrors the reference svgo.config.mjs used via:
// pnpx svgo -i <input-file> -o <output-file> --config svgo.config.mjs
export const svgoConfig: Config = {
  plugins: [
    "preset-default",
    {
      name: "removeAttrs",
      params: {
        // Remove hardcoded fill to allow color customization
        attrs: ["fill"],
      },
    },
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: [
          {
            // Use currentColor for dynamic control via React props or CSS
            fill: "currentColor",
            // Hide from screen readers if decorative
            "aria-hidden": "true",
          },
        ],
      },
    },
    // Remove width and height to allow responsiveness
    "removeDimensions",
  ],
};
