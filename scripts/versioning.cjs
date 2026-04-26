const fs = require("node:fs");
const path = require("node:path");

const MINOR_CHANGE_TYPES = new Set(["addition", "feat", "feature", "improvement", "minor"]);
const PATCH_CHANGE_TYPES = new Set([
  "build",
  "chore",
  "ci",
  "docs",
  "fix",
  "patch",
  "perf",
  "refactor",
  "revert",
  "style",
  "test",
]);

const classifyChangeType = (value) => {
  const normalizedValue = value.trim().toLowerCase();

  if (MINOR_CHANGE_TYPES.has(normalizedValue)) {
    return "minor";
  }

  if (PATCH_CHANGE_TYPES.has(normalizedValue)) {
    return "patch";
  }

  return null;
};

const getCommitMetadata = (subject, body = "") => {
  const normalizedSubject = subject.trim();
  const normalizedBody = body.trim();
  const match = normalizedSubject.match(/^([A-Za-z]+)(?:\([^)]+\))?(!)?:/);
  const parsedType = match ? classifyChangeType(match[1]) : null;
  const breakingChange =
    Boolean(match?.[2]) || /BREAKING[ -]CHANGE:/i.test(normalizedBody);

  return {
    breakingChange,
    changeType: parsedType,
    normalizedBody,
    normalizedSubject,
  };
};

const bumpVersion = (version, releaseType) => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Expected an x.y.z version, received "${version}".`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (releaseType) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unsupported release type "${releaseType}".`);
  }
};

const setManifestVersions = (packageJson, packageLockJson, appJson, nextVersion) => {
  return {
    appJson: {
      ...appJson,
      expo: {
        ...appJson.expo,
        version: nextVersion,
      },
    },
    packageJson: {
      ...packageJson,
      version: nextVersion,
    },
    packageLockJson: {
      ...packageLockJson,
      version: nextVersion,
      packages: {
        ...packageLockJson.packages,
        "": {
          ...packageLockJson.packages[""],
          version: nextVersion,
        },
      },
    },
  };
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const writeJson = (filePath, value) => {
  const nextContent = `${JSON.stringify(value, null, 2)}\n`;
  fs.writeFileSync(filePath, nextContent, "utf8");
};

const syncVersionFiles = (rootDir, nextVersion) => {
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageLockJsonPath = path.join(rootDir, "package-lock.json");
  const appJsonPath = path.join(rootDir, "app.json");
  const packageJson = readJson(packageJsonPath);
  const packageLockJson = readJson(packageLockJsonPath);
  const appJson = readJson(appJsonPath);
  const updatedFiles = setManifestVersions(
    packageJson,
    packageLockJson,
    appJson,
    nextVersion,
  );

  writeJson(packageJsonPath, updatedFiles.packageJson);
  writeJson(packageLockJsonPath, updatedFiles.packageLockJson);
  writeJson(appJsonPath, updatedFiles.appJson);
};

const validateExplicitVersion = (value) => {
  if (!/^\d+\.\d+\.\d+$/.test(value)) {
    throw new Error(`Expected an explicit x.y.z version, received "${value}".`);
  }

  return value;
};

module.exports = {
  bumpVersion,
  classifyChangeType,
  getCommitMetadata,
  setManifestVersions,
  syncVersionFiles,
  validateExplicitVersion,
};
