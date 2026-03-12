/**
 * @file axios.config.ts
 * Example configuration for generating a typescript-axios API client.
 *
 * Run with:
 *   npx ts-node axios.config.ts
 *
 * Or import in your own script:
 *   import { run } from "swagger-codegen-runner";
 *   import { config } from "./axios.config";
 *   await run(config);
 */

import { run, type Config } from "swagger-codegen-runner";
import * as path from "path";

const HOME = process.env.HOME ?? process.env.USERPROFILE ?? "";

export const config: Config = {
  // ── Paths ───────────────────────────────────────────────────────────────────
  swaggerCodegenDir: path.join(HOME, "tools/swagger-codegen"),
  projectDir: path.join(HOME, "projects/my-react-app"),

  /**
   * Relative path inside projectDir where generated files will be copied.
   * With typescript-axios it is common to place the entire generated client
   * in a dedicated folder and re-export from there.
   */
  outputDestinationRelativePath: "src/api/generated",
  cleanDestinationBeforeCopy: true,

  // ── Execution mode ──────────────────────────────────────────────────────────
  useDocker: false,
  dockerImage: "swaggerapi/swagger-codegen-cli-v3:latest",

  // ── Spec download ───────────────────────────────────────────────────────────
  /**
   * Download from a remote staging environment.
   * Set required: false so the runner falls back to inputSpec if unreachable.
   */
  downloadSpec: {
    url: "https://api-staging.example.com/docs-json",
    outputPath: "./swagger.json",
    required: false,
  },

  // ── Generation ──────────────────────────────────────────────────────────────
  generate: {
    language: "typescript-axios",

    inputSpec: "https://api.example.com/docs-json",

    outputDir: "samples/client/my-app/axios",

    additionalProperties: {
      // ── Naming ──────────────────────────────────────────────────────────────
      /**
       * Property naming convention for generated models.
       * Options: "camelCase" | "PascalCase" | "snake_case" | "original"
       */
      modelPropertyNaming: "camelCase",

      // ── Output structure ────────────────────────────────────────────────────
      /**
       * When true, the generator places APIs and models in separate sub-folders
       * (`apiPackage` and `modelPackage`) instead of a single flat output.
       */
      withSeparateModelsAndApi: true,

      /**
       * Sub-folder name for generated API classes.
       * Only used when withSeparateModelsAndApi is true.
       */
      apiPackage: "apis",

      /**
       * Sub-folder name for generated model classes.
       * Only used when withSeparateModelsAndApi is true.
       */
      modelPackage: "models",

      // ── npm package (optional) ───────────────────────────────────────────────
      // Uncomment if you want to publish the generated client as an npm package.
      // npmName: "@my-org/api-client-axios",
      // npmVersion: "1.0.0",
      // npmRepository: "https://nexus.example.com/repository/npm-internal",
      // snapshot: false,
    },
  },
};

// Run directly when invoked as a script
if (require.main === module) {
  run(config).catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}
