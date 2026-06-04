import tailwindcss from "@tailwindcss/postcss";
import {
  generateCss4,
  postcssRemoveComment,
} from "@weapp-tailwindcss/test-helper";
import fs from "fs-extra";
import path from "pathe";
import postcss from "postcss";
import { getCompilerContext } from "@/context";
import { createGetCase, createPutCase, cssCasePath, rootPath } from "../util";

const getCase = createGetCase(cssCasePath);
const putCase = createPutCase(cssCasePath);

type CompilerOptions = Parameters<typeof getCompilerContext>[0];

function getCtx(options?: CompilerOptions) {
  const postcssOptions = options?.postcssOptions ?? {};
  return getCompilerContext({
    ...options,
    postcssOptions: {
      ...postcssOptions,
      plugins: [postcssRemoveComment, ...(postcssOptions.plugins ?? [])],
    },
  });
}

describe("tailwindcss v4", () => {
  it("keeps Tailwind v4 variable-only input without injecting preflight reset defaults", async () => {
    const { styleHandler } = getCtx({
      tailwindcss: {
        packageName: "tailwindcss4",
      },
    });
    const borderProp = ["bor", "der"].join("");
    const { css } = await styleHandler(
      '::before,::after{--tw-content:"";--tw-border-spacing-x:0;}',
    );

    expect(css).toContain("--tw-border-spacing-x:0");
    expect(css).not.toContain("--tw-content");
    expect(css).not.toContain("box-sizing:border-box");
    expect(css).not.toContain("margin:0");
    expect(css).not.toContain("padding:0");
    expect(css).not.toContain(`${borderProp}:0 solid`);
    expect(css).not.toContain("border-width: 0");
    expect(css).not.toContain("border-style: solid");
    expect(css).not.toContain("border-color: currentColor");
  });

  it("generates linear background direction css with v4 source directive", async () => {
    const className = ["bg", "linear", "to", "r"].join("-");
    const sourceFunction = ["in", "line"].join("");
    const selector = `.${className}`;
    const { css: tailwindCss } = await generateCss4(rootPath, {
      css: `
        @import "tailwindcss/utilities" source(none);
        @source ${sourceFunction}("${className}");
      `,
    });
    expect(tailwindCss.trim()).toBe(
      [
        `${selector} {`,
        "  --tw-gradient-position: to right;",
        "  @supports (background-image: linear-gradient(in lab, red, red)) {",
        "    --tw-gradient-position: to right in oklab;",
        "  }",
        "  background-image: linear-gradient(var(--tw-gradient-stops));",
        "}",
      ].join("\n"),
    );

    const { styleHandler } = getCtx();
    const { css } = await styleHandler(tailwindCss);
    expect(css.trim()).toBe(
      [
        `${selector} {`,
        "  --tw-gradient-position: to right;",
        "}",
        `${selector} {`,
        "  background-image: linear-gradient(var(--tw-gradient-stops));",
        "}",
      ].join("\n"),
    );
    expect(css).not.toContain("@supports");
    expect(css).not.toContain("in oklab");
  });

  it("v4-default.css", async () => {
    const rawCss = await getCase("v4-default.css");
    const { styleHandler } = getCtx();
    const { css } = await styleHandler(rawCss);
    await putCase("v4-default-output.css", css);
    expect(css).toMatchSnapshot();
  });

  it("weapp-tailwindcss default", async () => {
    const filepath = path.resolve(rootPath, "./index.css");
    const rawCss = await fs.readFile(filepath, "utf8");
    const { styleHandler } = getCtx();
    const { css: hahaCss } = await postcss([
      tailwindcss({
        base: __dirname,
      }),
      postcssRemoveComment,
    ]).process(rawCss, {
      from: filepath,
    });
    expect(hahaCss).toMatchSnapshot("tailwindcss");
    await putCase("v4-weapp-tailwindcss-default-output.before.css", hahaCss);
    const { css } = await styleHandler(hahaCss);
    await putCase("v4-weapp-tailwindcss-default-output.css", css);
    expect(css).toMatchSnapshot();
  });

  it("weapp-tailwindcss default with layer", async () => {
    const filepath = path.resolve(rootPath, "./with-layer.css");
    const rawCss = await fs.readFile(filepath, "utf8");
    const { styleHandler } = getCtx();
    const { css: hahaCss } = await postcss([
      tailwindcss({
        base: __dirname,
      }),
      postcssRemoveComment,
    ]).process(rawCss, {
      from: filepath,
    });
    expect(hahaCss).toMatchSnapshot("tailwindcss");
    await putCase(
      "v4-weapp-tailwindcss-default-with-layer-output.before.css",
      hahaCss,
    );
    const { css } = await styleHandler(hahaCss);
    await putCase("v4-weapp-tailwindcss-default-with-layer-output.css", css);
    expect(css).toMatchSnapshot();
  });

  it("mpx handles tailwindcss v4.1.17 css bundle", async () => {
    const rawCss = await getCase("mpx-tailwindcss-v4.1.17.css");
    const { styleHandler } = getCtx({ appType: "mpx" });
    const { css } = await styleHandler(rawCss);
    await putCase("mpx-tailwindcss-v4.1.17-output.css", css);
    expect(css).toMatchSnapshot();
  });
});
