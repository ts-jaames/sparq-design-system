import { readJson, readText } from "./load.js";

const REPO = "ts-jaames/sparq-design-system";

export function packageVersion(): string {
  return readJson<{ version: string }>("package.json").version;
}

function minorRange(version: string): string {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}

export function cssUrl(version = packageVersion()): string {
  return `https://cdn.jsdelivr.net/gh/${REPO}@${minorRange(version)}/tokens/sparq-tokens.css`;
}

export const fontsUrl =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;500;600&family=IBM+Plex+Sans:wght@400;600&display=swap";

export function versionInfo() {
  const version = packageVersion();
  return {
    version,
    cssUrl: cssUrl(version),
    fontsUrl,
    mcpPackage: `github:${REPO}#semver:^${minorRange(version)}.0`,
    changelog: readText("CHANGELOG.md"),
    changelogUrl: `https://github.com/${REPO}/blob/main/CHANGELOG.md`,
  };
}
