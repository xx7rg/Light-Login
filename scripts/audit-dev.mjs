import { spawnSync } from "node:child_process";

// npm audits registry versions, not the source changes applied by patch-package.
// Only this tested local correction is accepted; every other advisory fails CI.
const patchedAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
if (!process.env.npm_execpath) {
  throw new Error("Execute this check through npm run audit:dev.");
}
const result = spawnSync(process.execPath, [process.env.npm_execpath, "audit", "--json"], {
  encoding: "utf8",
  timeout: 120_000,
  maxBuffer: 10 * 1024 * 1024,
});
if (result.error || ![0, 1].includes(result.status)) {
  throw result.error ?? new Error(`npm audit failed: ${result.stderr}`);
}
const report = JSON.parse(result.stdout);
if (report.error || !report.metadata || !report.vulnerabilities) {
  throw new Error(`Invalid audit response: ${result.stdout}`);
}
const entries = Object.values(report.vulnerabilities);
const advisories = entries.flatMap((entry) => entry.via).filter((via) => typeof via === "object");
const unknown = advisories.filter((via) => via.url !== patchedAdvisory || via.name !== "braces");
if (entries.length > 0 && advisories.length === 0) {
  throw new Error("Audit reported vulnerabilities without identifiable advisories.");
}
if (unknown.length > 0) {
  console.error("Unpatched dependency advisories:", unknown);
  process.exitCode = 1;
} else if (advisories.length > 0) {
  console.log(`npm still reports ${entries.length} affected development packages.`);
  console.log(`Accepted only ${patchedAdvisory}, protected by the versioned patch and security tests.`);
} else {
  console.log("No dependency advisories reported.");
}
