/**
 * @file runner.ts
 * Core execution logic: validates the environment, invokes swagger-codegen-cli
 * (via Docker or local Java), and copies the output to the destination project.
 */

import { execSync, spawnSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { log, errorExit } from "./logger";
import type { Config, BaseGenerateOptions } from "./types";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function commandExists(cmd: string): boolean {
  try {
    execSync(
      process.platform === "win32" ? `where ${cmd}` : `command -v ${cmd}`,
      { stdio: "ignore" }
    );
    return true;
  } catch {
    return false;
  }
}

function run(cmd: string, errorMessage: string, cwd?: string): void {
  const result = spawnSync(cmd, { shell: true, stdio: "inherit", cwd });
  if (result.status !== 0) errorExit(errorMessage);
}

function buildAdditionalPropertiesInline(
  props: Record<string, unknown>
): string {
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(",");
}

function buildSystemPropertyFlags(props: Record<string, string>): string {
  return Object.entries(props)
    .map(([k, v]) => `-D${k}=${v}`)
    .join(" ");
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateDirectories(cfg: Config): void {
  if (!(cfg.useDocker ?? false) && !fs.existsSync(cfg.swaggerCodegenDir)) {
    errorExit(`Swagger codegen directory not found: ${cfg.swaggerCodegenDir}`);
  }

  if (!fs.existsSync(cfg.projectDir)) {
    errorExit(`Project directory not found: ${cfg.projectDir}`);
  }

  if (cfg.outputDestinationRelativePath) {
    const dest = path.join(cfg.projectDir, cfg.outputDestinationRelativePath);
    if (!fs.existsSync(dest)) {
      errorExit(`Output destination directory not found: ${dest}`);
    }
  }
}

// ─── Runtime check ────────────────────────────────────────────────────────────

export function checkRuntime(cfg: Config): void {
  if (cfg.useDocker ?? false) {
    if (!commandExists("docker")) {
      errorExit(
        "Docker is not installed or not in PATH. Install Docker or set useDocker: false"
      );
    }
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch {
      errorExit("Docker daemon is not running. Please start Docker");
    }
    const image = cfg.dockerImage ?? "swaggerapi/swagger-codegen-cli-v3:latest";
    log(`Pulling Docker image: ${image} ...`);
    run(`docker pull ${image}`, "Failed to pull Docker image");
  } else {
    if (!commandExists("java")) {
      errorExit("Java is not installed or not in PATH");
    }
  }
}

// ─── Code generation ──────────────────────────────────────────────────────────

/**
 * Invokes swagger-codegen and returns the absolute path to the output directory.
 */
export function generateClient(cfg: Config): string {
  const useDocker       = cfg.useDocker ?? false;
  const opts            = cfg.generate;
  const lang            = opts.language;
  const relativeOutDir  = opts.outputDir ?? "samples/client/output";
  const outputDir       = path.join(cfg.swaggerCodegenDir, relativeOutDir);

  log(`Cleaning previous output: ${outputDir}`);
  fs.rmSync(outputDir, { recursive: true, force: true });

  log(`Generating [${lang}] from: ${opts.inputSpec}`);

  // ── Build flags ─────────────────────────────────────────────────────────────

  const sysPropFlags = opts.systemProperties
    ? buildSystemPropertyFlags(opts.systemProperties) + " "
    : "";

  const optionalFlags: string[] = [];
  if (opts.templateDir) optionalFlags.push(`-t "${opts.templateDir}"`);
  if (opts.models)      optionalFlags.push(`--models ${opts.models}`);
  if (opts.apis)        optionalFlags.push(`--apis ${opts.apis}`);

  // additionalProperties: prefer -c file over inline when configFilePath is set
  const additionalProps = (
    opts as BaseGenerateOptions & { additionalProperties?: Record<string, unknown> }
  ).additionalProperties;

  if (opts.configFilePath) {
    const json = JSON.stringify(additionalProps ?? {}, null, 2);
    fs.writeFileSync(opts.configFilePath, json, "utf8");
    log(`Written codegen config to: ${opts.configFilePath}`);
    optionalFlags.push(`-c "${opts.configFilePath}"`);
  } else if (additionalProps && Object.keys(additionalProps).length > 0) {
    const inline = buildAdditionalPropertiesInline(additionalProps);
    optionalFlags.push(`--additional-properties ${inline}`);
  }

  const extraFlags = optionalFlags.join(" \\\n    ");

  // ── Execute ─────────────────────────────────────────────────────────────────

  if (useDocker) {
    const image = cfg.dockerImage ?? "swaggerapi/swagger-codegen-cli-v3:latest";
    const cmd = [
      `docker run --rm`,
      `-v "${cfg.swaggerCodegenDir}:/local"`,
      `${image} generate`,
      `${sysPropFlags}-i "${opts.inputSpec}"`,
      `-l ${lang}`,
      `-o "/local/${relativeOutDir}"`,
      extraFlags,
    ]
      .filter(Boolean)
      .join(" \\\n  ");

    run(cmd, `Failed to generate [${lang}] with Docker`);
  } else {
    const jarPath = "modules/swagger-codegen-cli/target/swagger-codegen-cli.jar";
    const cmd = [
      `java ${sysPropFlags}-jar ${jarPath} generate`,
      `-i "${opts.inputSpec}"`,
      `-l ${lang}`,
      `-o ${relativeOutDir}`,
      extraFlags,
    ]
      .filter(Boolean)
      .join(" \\\n  ");

    run(cmd, `Failed to generate [${lang}] with local Java`, cfg.swaggerCodegenDir);
  }

  if (!fs.existsSync(outputDir)) {
    errorExit("Generation completed but output directory not found");
  }

  log(`Code generated in: ${outputDir}`);
  return outputDir;
}

// ─── Output copy ──────────────────────────────────────────────────────────────

/**
 * Copies the contents of `generatedDir` to the configured destination inside
 * `cfg.projectDir`. Skips the copy if `outputDestinationRelativePath` is unset.
 */
export function copyOutput(cfg: Config, generatedDir: string): void {
  if (!cfg.outputDestinationRelativePath) {
    log("outputDestinationRelativePath not set — skipping copy step.");
    return;
  }

  const destDir = path.join(cfg.projectDir, cfg.outputDestinationRelativePath);
  const clean   = cfg.cleanDestinationBeforeCopy ?? true;

  if (clean) {
    log(`Cleaning destination: ${destDir}`);
    for (const file of fs.readdirSync(destDir)) {
      fs.rmSync(path.join(destDir, file), { recursive: true, force: true });
    }
  }

  log(`Copying output to: ${destDir}`);
  for (const file of fs.readdirSync(generatedDir)) {
    fs.cpSync(
      path.join(generatedDir, file),
      path.join(destDir, file),
      { recursive: true }
    );
  }

  log(`Output copied to: ${destDir}`);
}
