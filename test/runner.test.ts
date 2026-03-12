/**
 * @file runner.test.ts
 * Unit tests for swagger-codegen-runner core logic.
 *
 * These tests mock the filesystem and child_process so they can run without
 * a real Java / Docker installation.
 */

import * as fs from "fs";
import * as path from "path";
import { validateDirectories, generateClient, copyOutput } from "../src/runner";
import type { Config } from "../src/types";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("child_process", () => ({
  execSync: jest.fn(),
  spawnSync: jest.fn().mockReturnValue({ status: 0 }),
}));

jest.mock("fs", () => {
  const actual = jest.requireActual<typeof fs>("fs");
  return {
    ...actual,
    existsSync: jest.fn(),
    rmSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn().mockReturnValue([]),
    writeFileSync: jest.fn(),
    cpSync: jest.fn(),
  };
});

const mockExistsSync = fs.existsSync as jest.Mock;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<Config> = {}): Config {
  return {
    swaggerCodegenDir: "/tools/swagger-codegen",
    projectDir: "/projects/my-app",
    outputDestinationRelativePath: "src/generated",
    cleanDestinationBeforeCopy: true,
    useDocker: false,
    generate: {
      language: "typescript-angular",
      inputSpec: "https://api.example.com/docs-json",
      outputDir: "samples/client/output",
      additionalProperties: { ngVersion: "19" },
    },
    ...overrides,
  };
}

// ─── validateDirectories ──────────────────────────────────────────────────────

describe("validateDirectories", () => {
  const exitSpy = jest
    .spyOn(process, "exit")
    .mockImplementation((_code?: string | number | null | undefined) => {
      throw new Error("process.exit called");
    });

  afterEach(() => jest.clearAllMocks());
  afterAll(() => exitSpy.mockRestore());

  it("passes when all directories exist", () => {
    mockExistsSync.mockReturnValue(true);
    expect(() => validateDirectories(makeConfig())).not.toThrow();
  });

  it("exits when swaggerCodegenDir is missing (local Java mode)", () => {
    mockExistsSync.mockImplementation((p: string) =>
      p !== "/tools/swagger-codegen"
    );
    expect(() => validateDirectories(makeConfig())).toThrow("process.exit called");
  });

  it("skips swaggerCodegenDir check in Docker mode", () => {
    // Docker mode: only projectDir and destination need to exist
    mockExistsSync.mockImplementation((p: string) =>
      p !== "/tools/swagger-codegen"
    );
    expect(() =>
      validateDirectories(makeConfig({ useDocker: true }))
    ).not.toThrow();
  });

  it("exits when projectDir is missing", () => {
    mockExistsSync.mockImplementation((p: string) => p !== "/projects/my-app");
    expect(() => validateDirectories(makeConfig())).toThrow("process.exit called");
  });
});

// ─── copyOutput ───────────────────────────────────────────────────────────────

describe("copyOutput", () => {
  const mockReaddir = fs.readdirSync as jest.Mock;

  afterEach(() => jest.clearAllMocks());

  it("skips copy when outputDestinationRelativePath is not set", () => {
    const cfg = makeConfig({ outputDestinationRelativePath: undefined });
    copyOutput(cfg, "/tools/swagger-codegen/samples/client/output");
    expect(fs.cpSync).not.toHaveBeenCalled();
  });

  it("copies each file from generatedDir to destDir", () => {
    mockReaddir.mockReturnValue(["model", "api"]);
    const cfg = makeConfig();
    copyOutput(cfg, "/tools/swagger-codegen/samples/client/output");

    const destDir = path.join(cfg.projectDir, cfg.outputDestinationRelativePath!);
    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join("/tools/swagger-codegen/samples/client/output", "model"),
      path.join(destDir, "model"),
      { recursive: true }
    );
    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join("/tools/swagger-codegen/samples/client/output", "api"),
      path.join(destDir, "api"),
      { recursive: true }
    );
  });

  it("skips copy when neither outputDestinationRelativePath nor copyRules is set", () => {
    const cfg = makeConfig({ outputDestinationRelativePath: undefined });
    copyOutput(cfg, "/tools/swagger-codegen/samples/client/output");
    expect(fs.cpSync).not.toHaveBeenCalled();
  });

  it("applies copyRules instead of outputDestinationRelativePath when both are set", () => {
    mockReaddir.mockReturnValue(["Pet.ts", "User.ts"]);
    const cfg = makeConfig({
      outputDestinationRelativePath: "src/generated",
      copyRules: [
        { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" },
      ],
    });
    copyOutput(cfg, "/tools/swagger-codegen/samples/client/output");

    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join("/tools/swagger-codegen/samples/client/output", "model", "Pet.ts"),
      path.join("/projects/my-app/src/app/shared/dto", "Pet.ts"),
      { recursive: true }
    );
    // outputDestinationRelativePath should be ignored
    expect(fs.cpSync).not.toHaveBeenCalledWith(
      expect.stringContaining("src/generated"),
      expect.anything(),
      expect.anything()
    );
  });

  it("applies multiple copyRules independently", () => {
    mockReaddir.mockReturnValue(["index.ts"]);
    const generatedDir = "/tools/swagger-codegen/samples/client/output";
    const cfg = makeConfig({
      outputDestinationRelativePath: undefined,
      copyRules: [
        { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" },
        { sourceSubPath: "api",   destinationRelativePath: "src/app/services/api" },
      ],
    });
    copyOutput(cfg, generatedDir);

    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join(generatedDir, "model", "index.ts"),
      path.join("/projects/my-app/src/app/shared/dto", "index.ts"),
      { recursive: true }
    );
    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join(generatedDir, "api", "index.ts"),
      path.join("/projects/my-app/src/app/services/api", "index.ts"),
      { recursive: true }
    );
  });

  it("copies the entire generated output when sourceSubPath is omitted in a copyRule", () => {
    mockReaddir.mockReturnValue(["model", "api"]);
    const generatedDir = "/tools/swagger-codegen/samples/client/output";
    const cfg = makeConfig({
      outputDestinationRelativePath: undefined,
      copyRules: [{ destinationRelativePath: "src/generated" }],
    });
    copyOutput(cfg, generatedDir);

    expect(fs.cpSync).toHaveBeenCalledWith(
      path.join(generatedDir, "model"),
      path.join("/projects/my-app/src/generated", "model"),
      { recursive: true }
    );
  });
});

// ─── Type narrowing (compile-time checks, not runtime) ───────────────────────

describe("type safety", () => {
  it("allows TypeScriptAngularAdditionalProperties for typescript-angular", () => {
    const cfg: Config = makeConfig({
      generate: {
        language: "typescript-angular",
        inputSpec: "https://api.example.com/docs-json",
        additionalProperties: {
          ngVersion: "19",
          withInterfaces: true,
          taggedUnions: false,
          kebabFileNaming: false,
          modelPropertyNaming: "camelCase",
        },
      },
    });
    expect(cfg.generate.language).toBe("typescript-angular");
  });

  it("allows TypeScriptAxiosAdditionalProperties for typescript-axios", () => {
    const cfg: Config = makeConfig({
      generate: {
        language: "typescript-axios",
        inputSpec: "https://api.example.com/docs-json",
        additionalProperties: {
          withSeparateModelsAndApi: true,
          apiPackage: "apis",
          modelPackage: "models",
        },
      },
    });
    expect(cfg.generate.language).toBe("typescript-axios");
  });

  it("allows SpringAdditionalProperties for spring", () => {
    const cfg: Config = makeConfig({
      generate: {
        language: "spring",
        inputSpec: "https://api.example.com/docs-json",
        additionalProperties: {
          apiPackage: "com.example.api",
          modelPackage: "com.example.model",
          reactive: true,
          interfaceOnly: false,
        },
      },
    });
    expect(cfg.generate.language).toBe("spring");
  });
});
