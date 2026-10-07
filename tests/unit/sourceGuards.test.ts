/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(import.meta.dirname, "../../src");

function listSources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory())
      return name === "__tests__" ? [] : listSources(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

const files = listSources(SRC);
function relative(file: string): string {
  return path.relative(SRC, file);
}
const componentAndFeatureFiles = files.filter((file) =>
  /^(components|features)\//.test(relative(file)),
);

describe("source guards", () => {
  it("UI-FND-01: When scanning src, should find no raw hex colour outside index.css", () => {
    const offenders = files.filter((file) =>
      /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it("UI-FND-06: When scanning components and features, should find no literal Thai text", () => {
    const offenders = componentAndFeatureFiles.filter((file) =>
      /[฀-๿]/.test(readFileSync(file, "utf8")),
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it("UI-FND-08: When scanning components, should find no truncating classes", () => {
    const offenders = componentAndFeatureFiles.filter((file) =>
      /\b(truncate|text-ellipsis|line-clamp-\d)\b/.test(
        readFileSync(file, "utf8"),
      ),
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it("UI-FND-01: When reading index.html, should load Prompt and IBM Plex Sans Thai from Google Fonts with preconnect", () => {
    const html = readFileSync(path.resolve(SRC, "../index.html"), "utf8");
    expect(html).toContain(
      'rel="preconnect" href="https://fonts.googleapis.com"',
    );
    expect(html).toContain("family=Prompt");
    expect(html).toContain("family=IBM+Plex+Sans+Thai");
    expect(html).toContain("display=swap");
  });

  it("UI-FND-01: When reading index.css, should declare real fallback font stacks", () => {
    const css = readFileSync(path.resolve(SRC, "index.css"), "utf8");
    expect(css).toContain(
      '--font-display: "Prompt", "IBM Plex Sans Thai", system-ui, sans-serif',
    );
    expect(css).toContain(
      '--font-sans: "IBM Plex Sans Thai", "IBM Plex Sans", system-ui, sans-serif',
    );
    expect(css).not.toContain("@fontsource");
  });
});
