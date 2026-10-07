import { describe, it, expect, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const REPO = path.resolve(__dirname, "../..");

function git(args: string[], cwd = REPO): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function inGitRepo(): boolean {
  try {
    return git(["rev-parse", "--show-toplevel"]).trim().length > 0;
  } catch {
    return false;
  }
}

// Samples are assembled at runtime so this file never contains a key-shaped literal.
const SECRET_PATTERNS: Record<string, { re: RegExp; sample: string }> = {
  "openai/anthropic key": { re: /sk-[A-Za-z0-9_-]{20,}/, sample: "sk-" + "a1B2".repeat(8) },
  "aws access key": { re: /AKIA[0-9A-Z]{16}/, sample: "AKIA" + "Q".repeat(16) },
  "github token": {
    re: /(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}/,
    sample: "ghp_" + "x9Y8".repeat(9),
  },
  "slack token": { re: /xox[baprs]-[A-Za-z0-9-]{10,}/, sample: "xoxb-" + "1234567890".repeat(2) },
  "google api key": { re: /AIza[0-9A-Za-z_-]{35}/, sample: "AIza" + "k7J2".repeat(9) },
  "stripe live key": { re: /[sr]k_live_[0-9a-zA-Z]{20,}/, sample: "sk_" + "live_" + "z8X7".repeat(6) },
  "private key block": {
    re: /-----BEGIN ([A-Z]+ )?PRIVATE KEY-----/,
    sample: "-----BEGIN " + "RSA PRIVATE KEY-----",
  },
  jwt: {
    re: /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\./,
    sample: "eyJ" + "h".repeat(20) + "." + "p".repeat(20) + ".sig",
  },
  "url with credentials": {
    re: /[a-z]+:\/\/[^/\s:@]+:[^/\s@]{3,}@/,
    sample: "postgres" + "://admin:" + "hunter2hunter2" + "@db.example.com/app",
  },
  "secret assignment": {
    re: /(api[_-]?key|secret|access[_-]?token|auth[_-]?token|passwd|password)["']?\s*[:=]\s*["'][^"']{8,}["']/i,
    sample: "API_" + "KEY = '" + "abcd1234efgh5678" + "'",
  },
};

function findSecrets(text: string): string[] {
  return Object.entries(SECRET_PATTERNS)
    .filter(([, { re }]) => re.test(text))
    .map(([name]) => name);
}

const ENV_FILE = /(^|\/)\.env($|\.)/;

function historyPaths(cwd = REPO): string[] {
  const names = git(["log", "--all", "--name-only", "--pretty=format:"], cwd)
    .split("\n")
    .filter(Boolean);
  return [...new Set(names)];
}

function historyText(cwd = REPO): string {
  return git(["log", "--all", "-p", "-U0", "--no-color", "--no-ext-diff"], cwd);
}

function checkoutText(cwd = REPO): { file: string; text: string }[] {
  const files = git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd)
    .split("\0")
    .filter(Boolean);
  const out: { file: string; text: string }[] = [];
  for (const file of files) {
    const full = path.join(cwd, file);
    let size: number;
    try {
      size = statSync(full).size;
    } catch {
      continue;
    }
    if (size > 5 * 1024 * 1024) continue;
    const buf = readFileSync(full);
    if (buf.includes(0)) continue;
    out.push({ file, text: buf.toString("utf8") });
  }
  return out;
}

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function makeRepoWithLeakedHistory(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "ltcube-hygiene-"));
  tempDirs.push(dir);
  const run = (...args: string[]) =>
    git(["-c", "user.name=t", "-c", "user.email=t@example.com", ...args], dir);
  run("init", "-q");
  writeFileSync(path.join(dir, ".env.local"), "TOKEN=1\n");
  writeFileSync(
    path.join(dir, "leak.txt"),
    Object.values(SECRET_PATTERNS)
      .map((p) => p.sample)
      .join("\n") + "\n",
  );
  run("add", "-f", "-A");
  run("commit", "-q", "-m", "leak");
  run("rm", "-q", ".env.local", "leak.txt");
  run("commit", "-q", "-m", "remove leak");
  return dir;
}

describe.skipIf(!inGitRepo())("repo hygiene (backlog N3)", () => {
  it("ignores .claude/settings.local.json", () => {
    expect(() => git(["check-ignore", "-q", ".claude/settings.local.json"])).not.toThrow();
    const lines = readFileSync(path.join(REPO, ".gitignore"), "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim());
    expect(lines).toContain(".claude/settings.local.json");
  });

  it("does not track .claude/settings.local.json now or in any past commit", () => {
    expect(git(["ls-files", ".claude/settings.local.json"]).trim()).toBe("");
    expect(git(["log", "--all", "--format=%h", "--", ".claude/settings.local.json"]).trim()).toBe("");
  });

  it("has never committed a .env file", () => {
    const tracked = git(["ls-files"]).split("\n").filter((f) => ENV_FILE.test(f));
    expect(tracked).toEqual([]);
    expect(historyPaths().filter((f) => ENV_FILE.test(f))).toEqual([]);
  });

  it("has no key-shaped strings in any file that would be committed", () => {
    const hits = checkoutText().flatMap(({ file, text }) =>
      findSecrets(text).map((name) => `${file}: ${name}`),
    );
    expect(hits).toEqual([]);
  });

  it("has no local machine paths in any file that would be committed", () => {
    const LOCAL_PATH = /[A-Za-z]:[\\/]+Users[\\/]|\/Users\/[^/\s]+\/|\/home\/[^/\s]+\//;
    const hits = checkoutText()
      .filter(({ file, text }) => file !== "package-lock.json" && LOCAL_PATH.test(text))
      .map(({ file }) => file);
    expect(hits).toEqual([]);
  });

  it("has no key-shaped strings anywhere in git history", () => {
    expect(findSecrets(historyText())).toEqual([]);
  });

  it("the scanners catch a planted leak that was later deleted (control)", () => {
    const dir = makeRepoWithLeakedHistory();
    expect(git(["status", "--porcelain"], dir).trim()).toBe("");
    expect(historyPaths(dir).filter((f) => ENV_FILE.test(f))).toEqual([".env.local"]);
    expect(findSecrets(historyText(dir)).sort()).toEqual(Object.keys(SECRET_PATTERNS).sort());
  });
});
