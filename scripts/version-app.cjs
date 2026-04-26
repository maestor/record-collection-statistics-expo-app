const { execFileSync } = require("node:child_process");
const path = require("node:path");
const {
  bumpVersion,
  getCommitMetadata,
  syncVersionFiles,
  validateExplicitVersion,
} = require("./versioning.cjs");

const rootDir = process.cwd();
const packageJson = require(path.join(rootDir, "package.json"));

const printUsage = () => {
  console.log("Usage:");
  console.log("  npm run version:auto");
  console.log("  npm run version:bump -- <change-type>");
  console.log("  npm run version:set -- <x.y.z>");
};

const getHeadCommit = () => {
  const subject = execFileSync("git", ["log", "-1", "--pretty=%s"], {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
  const body = execFileSync("git", ["log", "-1", "--pretty=%b"], {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();

  return { body, subject };
};

const finish = (currentVersion, nextVersion, reason) => {
  syncVersionFiles(rootDir, nextVersion);
  console.log(`${currentVersion} -> ${nextVersion} (${reason})`);
};

const runAuto = () => {
  const currentVersion = packageJson.version;
  const { body, subject } = getHeadCommit();
  const metadata = getCommitMetadata(subject, body);

  if (metadata.breakingChange) {
    throw new Error(
      "Breaking changes require an explicit major decision. Use npm run version:set -- <next-major>.0.0 when you want to approve that bump.",
    );
  }

  if (!metadata.changeType) {
    throw new Error(
      `Could not infer a version bump from "${subject}". Use a supported prefix such as Feature:, Addition:, Improvement:, Fix:, Refactor:, Chore:, Docs:, Test:, Build:, CI:, Perf:, or Style:, or run npm run version:bump -- <change-type>.`,
    );
  }

  const nextVersion = bumpVersion(currentVersion, metadata.changeType);
  finish(currentVersion, nextVersion, `auto ${metadata.changeType} from HEAD commit`);
};

const runBump = (changeType) => {
  const currentVersion = packageJson.version;
  const normalizedChangeType = getCommitMetadata(`${changeType}: manual bump`).changeType;

  if (!normalizedChangeType) {
    throw new Error(
      `Unsupported change type "${changeType}". Use one of: addition, feat, feature, improvement, fix, refactor, chore, docs, test, build, ci, perf, style, revert, patch, or minor.`,
    );
  }

  const nextVersion = bumpVersion(currentVersion, normalizedChangeType);
  finish(currentVersion, nextVersion, `manual ${normalizedChangeType}`);
};

const runSet = (version) => {
  const currentVersion = packageJson.version;
  const nextVersion = validateExplicitVersion(version);
  finish(currentVersion, nextVersion, "explicit set");
};

const command = process.argv[2];
const argument = process.argv[3];

try {
  switch (command) {
    case "auto":
      runAuto();
      break;
    case "bump":
      if (!argument) {
        throw new Error("Missing change type for npm run version:bump -- <change-type>.");
      }
      runBump(argument);
      break;
    case "set":
      if (!argument) {
        throw new Error("Missing version for npm run version:set -- <x.y.z>.");
      }
      runSet(argument);
      break;
    default:
      printUsage();
      throw new Error(`Unsupported command "${command ?? ""}".`);
  }
} catch (error) {
  console.error(String(error instanceof Error ? error.message : error));
  process.exitCode = 1;
}
