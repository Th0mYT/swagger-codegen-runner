/**
 * @file index.ts
 * Public API for swagger-codegen-runner.
 *
 * @example
 * ```typescript
 * import { run, type Config } from "swagger-codegen-runner";
 *
 * const config: Config = {
 *   swaggerCodegenDir: "/path/to/swagger-codegen",
 *   projectDir: "/path/to/my-angular-app",
 *   outputDestinationRelativePath: "src/app/shared/dto",
 *   generate: {
 *     language: "typescript-angular",
 *     inputSpec: "https://api.example.com/docs-json",
 *     additionalProperties: { ngVersion: "19" },
 *   },
 * };
 *
 * await run(config);
 * ```
 */

export * from "./types";

import { downloadSpec } from "./downloader";
import { validateDirectories, checkRuntime, generateClient, copyOutput } from "./runner";
import { log, warn, errorExit } from "./logger";
import type { Config } from "./types";

/**
 * Runs the full swagger-codegen pipeline:
 *
 * 1. Validates that required directories exist.
 * 2. Checks that Docker or Java is available.
 * 3. (Optional) Downloads the OpenAPI spec from `config.downloadSpec.url`.
 * 4. Invokes swagger-codegen-cli to generate code.
 * 5. Copies the generated output to `config.projectDir`.
 *
 * @param config Full runner configuration.
 * @throws Calls `process.exit(1)` on unrecoverable errors.
 */
export async function run(config: Config): Promise<void> {
  log(`swagger-codegen-runner starting [${config.generate.language}]...`);

  validateDirectories(config);
  checkRuntime(config);

  // ── Optional spec download ──────────────────────────────────────────────────
  if (config.downloadSpec) {
    const {
      url,
      outputPath = "./swagger.json",
      required = true,
    } = config.downloadSpec;

    try {
      const localPath = await downloadSpec(url, outputPath);
      config.generate.inputSpec = localPath;
    } catch (err) {
      if (required) {
        errorExit(`Failed to download spec: ${String(err)}`);
      } else {
        warn(
          `Could not download spec (${String(err)}). ` +
          `Falling back to inputSpec: ${config.generate.inputSpec}`
        );
      }
    }
  }

  // ── Generate & copy ─────────────────────────────────────────────────────────
  const generatedDir = generateClient(config);
  copyOutput(config, generatedDir);

  log("swagger-codegen-runner done.");
}

// Re-export logger utilities so consumers can integrate with their own tooling
export { log, warn } from "./logger";
