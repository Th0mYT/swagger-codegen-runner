/**
 * @file angular.config.ts
 * Example configuration for generating a typescript-angular API client.
 *
 * Run with:
 *   npx ts-node angular.config.ts
 *
 * Or import in your own script:
 *   import { run } from "swagger-codegen-runner";
 *   import { config } from "./angular.config";
 *   await run(config);
 */

import { run, type Config } from "swagger-codegen-runner";
import * as path from "path";

const HOME = process.env.HOME ?? process.env.USERPROFILE ?? "";

export const config: Config = {
  // ── Paths ───────────────────────────────────────────────────────────────────
  swaggerCodegenDir: path.join(HOME, "tools/swagger-codegen"),
  projectDir: path.join(HOME, "projects/my-angular-app"),

  /**
   * Relative path inside projectDir where the generated DTOs will be copied.
   * The runner copies the `model/` sub-folder of the codegen output here.
   */
  outputDestinationRelativePath: "src/app/shared/dto",

  /** Empty the destination folder before copying. Keeps it in sync. */
  cleanDestinationBeforeCopy: true,

  // ── Execution mode ──────────────────────────────────────────────────────────
  /** Set to true to use Docker instead of a local Java installation. */
  useDocker: false,
  dockerImage: "swaggerapi/swagger-codegen-cli-v3:latest",

  // ── Spec download ───────────────────────────────────────────────────────────
  /**
   * Download the spec from a local development server before running codegen.
   * The saved swagger.json can be committed to the repo for offline reference.
   *
   * Remove this block to use `generate.inputSpec` directly.
   */
  downloadSpec: {
    url: "http://localhost:3000/docs-json",
    outputPath: "./swagger.json",
    required: true,
  },

  // ── Generation ──────────────────────────────────────────────────────────────
  generate: {
    language: "typescript-angular",

    /**
     * Primary spec URL — used if downloadSpec is absent or fails with
     * required: false.
     */
    inputSpec: "https://api.example.com/docs-json",

    /** Where codegen writes its output (relative to swaggerCodegenDir). */
    outputDir: "samples/client/my-app/angular",

    // Uncomment to write additionalProperties to a JSON file (-c flag) instead
    // of passing them inline. Preferred when you have many options.
    // configFilePath: "./swagger-angular.config.json",

    // Uncomment to use custom Mustache templates:
    // templateDir: "./templates/angular",

    // Uncomment to trust self-signed TLS certificates (local servers):
    // systemProperties: {
    //   "io.swagger.parser.util.RemoteUrl.trustAll": "true",
    // },

    additionalProperties: {
      // ── Angular ─────────────────────────────────────────────────────────────
      /** Angular version — controls HttpClient variant, RxJS API, module format. */
      ngVersion: "19",

      /**
       * Generate a TypeScript interface alongside each model class.
       * Useful when you want a pure-type contract independent of the class.
       */
      withInterfaces: false,

      /**
       * Use discriminated (tagged) unions for models that declare a
       * `discriminator` in the OpenAPI spec.
       */
      taggedUnions: false,

      /** Use kebab-case file names (e.g. my-model.ts). */
      kebabFileNaming: false,

      // ── Naming ──────────────────────────────────────────────────────────────
      /**
       * Property naming convention for generated models.
       * Options: "camelCase" | "PascalCase" | "snake_case" | "original"
       */
      modelPropertyNaming: "camelCase",

      // ── npm package (optional) ───────────────────────────────────────────────
      // Uncomment if you want to publish the generated client as an npm package.
      // npmName: "@my-org/api-client",
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
