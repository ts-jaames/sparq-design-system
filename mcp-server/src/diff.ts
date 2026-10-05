import { maxFilesPerBatch } from "./adoption.js";

export type Finding = {
  file: string;
  line: number | null;
  text: string;
  reason: string;
};

export type DiffReport = {
  pass: boolean;
  stage: string | null;
  fileCount: number;
  maxFiles: number | null;
  overBudget: boolean;
  files: string[];
  revert: Finding[];
  review: Finding[];
  next: string;
};

type Line = { line: number; text: string };
type Hunk = { removed: Line[]; added: Line[] };
type FileDiff = {
  path: string;
  sawPlus: boolean;
  created: boolean;
  deleted: boolean;
  renamed: boolean;
  binary: boolean;
  hunks: Hunk[];
};

const STYLE_FILE = /\.(css|scss|sass|less|styl|pcss)$/i;
const DOC_FILE = /\.(md|mdx|txt)$/i;
const SPARQ_FILE = /(^|\/)(AGENTS\.md|CLAUDE\.md|SPARQ_ADOPTION\.md|\.mcp\.json|mcp\.json)$/;
const LOCKED_FILE =
  /(^|\/)(package\.json|package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|\.env[^/]*|[^/]+\.(sql|prisma|graphql|gql))$/i;
const LOCKED_DIR = /(^|\/)(api|server|migrations|db|store|stores|reducers|services|hooks)\//i;
const THEME_FILE =
  /(theme|tailwind\.config|global|root|tokens|variables|index\.html|_document|_app|layout)/i;

const SPARQ_LINK = /sparq-design-system|sparq-tokens|orbs\.js|fonts\.googleapis|fonts\.gstatic|rel=["'](stylesheet|preconnect)["']/i;
const STYLE_IMPORT = /\.(css|scss|sass|less)["']/i;

const OPERATIONAL: { reason: string; pattern: RegExp }[] = [
  { reason: "event handler", pattern: /\bon[A-Z]\w*\s*=\s*(\{[^}]*\}?|"[^"]*"|'[^']*')?/g },
  { reason: "event handler", pattern: /(?:v-on:|@)[a-z][\w.-]*\s*=\s*"[^"]*"/g },
  { reason: "event handler", pattern: /\bon:[a-z]\w*(\s*=\s*\{[^}]*\}?)?/g },
  { reason: "event handler", pattern: /\bon[a-z]+\s*=\s*"[^"]*"/g },
  { reason: "hook or effect", pattern: /\buse[A-Z]\w*\s*\(/g },
  { reason: "request", pattern: /\b(fetch|axios|XMLHttpRequest|ajax)\b|\$http\b/g },
  { reason: "async flow", pattern: /\b(await|async)\b|\.then\s*\(/g },
  { reason: "state update", pattern: /\bset[A-Z]\w*\s*\(|\bdispatch\s*\(|\$?emit\s*\(/g },
  {
    reason: "routing",
    pattern:
      /\b(navigate|redirect)\s*\(|\b(router|history)\.\w+|<(Route|Link|NuxtLink|RouterLink)\b|\bto\s*=\s*("[^"]*"|\{[^}]*\})|\bhref\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\})/g,
  },
  {
    reason: "form or validation attribute",
    pattern:
      /\b(type|name|value|defaultValue|checked|disabled|required|pattern|min|max|minLength|maxLength|step|action|method|formAction)\s*=\s*("[^"]*"|'[^']*'|\{[^}]*\}?)/g,
  },
  { reason: "import", pattern: /^\s*import\b.*$|\brequire\s*\([^)]*\)/g },
];

const PRESENTATION =
  /\b(class|className|style|styles|styleName|css|sx|tw|cn|clsx|classnames)\b|--sparq-|var\(|sparq-|data-orb|aria-hidden|focus|font|color|background|border|outline|padding|margin|gap|radius|shadow|Plex|monospace|sans-serif/i;
const MARKUP_ONLY = /^<\/?[A-Za-z][\w.:-]*\s*\/?>$|^[\s{}()[\];,>/]*$/;
const COMMENT = /^(\/\/|\/\*|\*|<!--|\{\/\*)/;

function parse(diff: string): FileDiff[] {
  const files: FileDiff[] = [];
  let current: FileDiff | null = null;
  let hunk: Hunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  const start = (path: string, sawPlus: boolean) => {
    current = {
      path,
      sawPlus,
      created: false,
      deleted: false,
      renamed: false,
      binary: false,
      hunks: [],
    };
    files.push(current);
    hunk = null;
  };

  for (const raw of diff.split(/\r?\n/)) {
    if (raw.startsWith("diff --git ")) {
      const match = / b\/(.+)$/.exec(raw);
      start(match ? match[1] : raw.slice(11), false);
      continue;
    }
    const file = current as FileDiff | null;
    if (raw.startsWith("+++ ")) {
      const path = raw.slice(4).replace(/^b\//, "").trim();
      if (!file || file.sawPlus) {
        if (path !== "/dev/null") start(path, true);
      } else {
        file.sawPlus = true;
      }
      continue;
    }
    if (raw.startsWith("--- ")) continue;
    if (!file) continue;
    if (raw.startsWith("new file mode")) file.created = true;
    else if (raw.startsWith("deleted file mode")) file.deleted = true;
    else if (raw.startsWith("rename from")) file.renamed = true;
    else if (raw.startsWith("Binary files")) file.binary = true;
    else if (raw.startsWith("@@")) {
      const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)/.exec(raw);
      oldLine = match ? Number(match[1]) : 0;
      newLine = match ? Number(match[2]) : 0;
      hunk = { removed: [], added: [] };
      file.hunks.push(hunk);
    } else if (hunk) {
      const open = hunk as Hunk;
      if (raw.startsWith("+")) open.added.push({ line: newLine++, text: raw.slice(1) });
      else if (raw.startsWith("-")) open.removed.push({ line: oldLine++, text: raw.slice(1) });
      else if (raw.startsWith("\\")) continue;
      else {
        oldLine++;
        newLine++;
      }
    }
  }
  return files;
}

function snippets(text: string): { key: string; reason: string }[] {
  if (SPARQ_LINK.test(text)) return [];
  const found: { key: string; reason: string }[] = [];
  for (const { reason, pattern } of OPERATIONAL) {
    if (reason === "import" && STYLE_IMPORT.test(text)) continue;
    for (const match of text.matchAll(pattern)) {
      found.push({ key: `${reason}:${match[0].replace(/\s+/g, " ").trim()}`, reason });
    }
  }
  return found;
}

function checkHunk(path: string, hunk: Hunk, revert: Finding[], review: Finding[]) {
  const removedCounts = new Map<string, number>();
  const removedLines = new Map<string, { line: Line; reason: string }[]>();
  for (const line of hunk.removed) {
    for (const item of snippets(line.text)) {
      removedCounts.set(item.key, (removedCounts.get(item.key) ?? 0) + 1);
      const list = removedLines.get(item.key) ?? [];
      list.push({ line, reason: item.reason });
      removedLines.set(item.key, list);
    }
  }

  const flagged = new Set<Line>();
  for (const line of hunk.added) {
    for (const item of snippets(line.text)) {
      const left = removedCounts.get(item.key) ?? 0;
      if (left > 0) {
        removedCounts.set(item.key, left - 1);
        continue;
      }
      if (!flagged.has(line)) {
        revert.push({ file: path, line: line.line, text: line.text.trim(), reason: `adds ${item.reason}` });
        flagged.add(line);
      }
    }
  }
  for (const [key, left] of removedCounts) {
    const list = removedLines.get(key) ?? [];
    for (const { line, reason } of list.slice(list.length - left)) {
      if (flagged.has(line)) continue;
      revert.push({ file: path, line: line.line, text: line.text.trim(), reason: `removes or changes ${reason}` });
      flagged.add(line);
    }
  }

  for (const line of [...hunk.removed, ...hunk.added]) {
    if (flagged.has(line)) continue;
    const text = line.text.trim();
    if (!text || COMMENT.test(text) || MARKUP_ONLY.test(text)) continue;
    if (PRESENTATION.test(text) || SPARQ_LINK.test(text)) continue;
    review.push({ file: path, line: line.line, text, reason: "not recognised as presentation" });
  }
}

export function checkDiff(diff: string, stage?: string, maxFiles?: number): DiffReport {
  const revert: Finding[] = [];
  const review: Finding[] = [];
  const files = parse(diff);
  const productFiles: string[] = [];

  for (const file of files) {
    if (SPARQ_FILE.test(file.path) || DOC_FILE.test(file.path)) continue;
    productFiles.push(file.path);

    if (file.deleted) {
      revert.push({ file: file.path, line: null, text: "", reason: "deletes a file" });
      continue;
    }
    if (LOCKED_FILE.test(file.path) || LOCKED_DIR.test(file.path)) {
      revert.push({ file: file.path, line: null, text: "", reason: "dependency, config, or operational file" });
      continue;
    }
    if (file.binary) {
      review.push({ file: file.path, line: null, text: "", reason: "binary change" });
      continue;
    }
    if (file.renamed) {
      review.push({ file: file.path, line: null, text: "", reason: "renames a file" });
    }
    if (STYLE_FILE.test(file.path)) continue;
    if (file.created) {
      review.push({ file: file.path, line: null, text: "", reason: "new non-style file" });
    }
    if (stage === "foundation" && !THEME_FILE.test(file.path)) {
      review.push({
        file: file.path,
        line: null,
        text: "",
        reason: "foundation edits the theme layer only; this looks like a component file",
      });
    }
    for (const hunk of file.hunks) checkHunk(file.path, hunk, revert, review);
  }

  const budget = stage === "surfaces" ? (maxFiles ?? maxFilesPerBatch()) : (maxFiles ?? null);
  const overBudget = budget !== null && productFiles.length > budget;
  const pass = revert.length === 0 && !overBudget;

  const next: string[] = [];
  if (revert.length) next.push("Revert each hunk under revert and record its intent as a suggestion in SPARQ_ADOPTION.md. Then run this check again.");
  if (overBudget) next.push(`This batch changes ${productFiles.length} files, over the limit of ${budget}. Stop and report, and split the batch in SPARQ_ADOPTION.md.`);
  if (review.length) next.push("Justify each line under review in the report, or revert it.");
  if (pass) next.push("Gate passed. Run the app's typecheck, tests, and build if it has them, report, then stop.");

  return {
    pass,
    stage: stage ?? null,
    fileCount: productFiles.length,
    maxFiles: budget,
    overBudget,
    files: productFiles,
    revert,
    review,
    next: next.join(" "),
  };
}
