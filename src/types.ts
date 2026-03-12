/**
 * @file types.ts
 * All public types for swagger-codegen-runner.
 *
 * The `generate.language` field is a discriminated union key: setting it
 * automatically narrows `additionalProperties` to the correct interface
 * for that generator, giving full IntelliSense and compile-time safety.
 *
 * @see https://github.com/swagger-api/swagger-codegen
 */

// ─── Language union types ─────────────────────────────────────────────────────

/** All supported API client generators (swagger-codegen v3). */
export type ApiClientLanguage =
  | "csharp"
  | "csharp-dotnet2"
  | "dart"
  | "go"
  | "java"
  | "javascript"
  | "jaxrs-cxf-client"
  | "kotlin-client"
  | "php"
  | "python"
  | "r"
  | "ruby"
  | "scala"
  | "swift3"
  | "swift4"
  | "swift5"
  | "typescript-angular"
  | "typescript-axios"
  | "typescript-fetch";

/** All supported server stub generators (swagger-codegen v3). */
export type ServerStubLanguage =
  | "aspnetcore"
  | "go-server"
  | "inflector"
  | "java-vertx"
  | "jaxrs-cxf"
  | "jaxrs-cxf-cdi"
  | "jaxrs-di"
  | "jaxrs-jersey"
  | "jaxrs-resteasy"
  | "jaxrs-resteasy-eap"
  | "jaxrs-spec"
  | "kotlin-server"
  | "micronaut"
  | "nodejs-server"
  | "python-flask"
  | "scala-akka-http-server"
  | "spring";

/** All supported documentation generators (swagger-codegen v3). */
export type DocumentationLanguage =
  | "dynamic-html"
  | "html"
  | "html2"
  | "openapi"
  | "openapi-yaml";

/** Union of every supported generator language. */
export type CodegenLanguage =
  | ApiClientLanguage
  | ServerStubLanguage
  | DocumentationLanguage;

// ─── Additional properties per generator ─────────────────────────────────────
// Each interface matches the options exposed by:
//   java -jar swagger-codegen-cli.jar config-help -l <language>

/** Shared npm-related properties available to every TypeScript generator. */
export interface TypeScriptCommonAdditionalProperties {
  /**
   * Naming convention applied to model properties.
   * @default "camelCase"
   */
  modelPropertyNaming?: "camelCase" | "PascalCase" | "snake_case" | "original";
  /**
   * Name under which the generated code will be published as an npm package.
   * @example "@my-org/api-client"
   */
  npmName?: string;
  /**
   * Version of the generated npm package.
   * @default "1.0.0"
   */
  npmVersion?: string;
  /**
   * URL of a private npm registry set in `publishConfig` inside package.json.
   * Prevents accidental publishing to the public npmjs.com registry.
   * @example "https://nexus.example.com/repository/npm-internal"
   */
  npmRepository?: string;
  /**
   * Appends a timestamp snapshot suffix to the npm version when `true`
   * (e.g. `"1.0.0-SNAPSHOT.202501011200"`). Useful for unique CI builds.
   * @default false
   */
  snapshot?: boolean;
}

/**
 * Additional properties for the `typescript-angular` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptAngularClientCodegen.java
 */
export interface TypeScriptAngularAdditionalProperties
  extends TypeScriptCommonAdditionalProperties {
  /**
   * Angular version to target. Controls which RxJS API, HttpClient variant,
   * and module patterns are emitted.
   * @example "19"
   */
  ngVersion?: string;
  /**
   * Generate a TypeScript interface alongside each model class.
   * @default false
   */
  withInterfaces?: boolean;
  /**
   * Use TypeScript discriminated (tagged) unions for models that declare a
   * `discriminator` in the spec.
   * @default false
   */
  taggedUnions?: boolean;
  /**
   * Use kebab-case file names (e.g. `my-model.ts`) instead of camelCase.
   * @default false
   */
  kebabFileNaming?: boolean;
}

/**
 * Additional properties for the `typescript-axios` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptAxiosClientCodegen.java
 */
export interface TypeScriptAxiosAdditionalProperties
  extends TypeScriptCommonAdditionalProperties {
  /**
   * Organise output into separate `api/` and `model/` folders.
   * @default false
   */
  withSeparateModelsAndApi?: boolean;
  /**
   * Sub-folder name for API classes (requires `withSeparateModelsAndApi`).
   * @example "apis"
   */
  apiPackage?: string;
  /**
   * Sub-folder name for model classes (requires `withSeparateModelsAndApi`).
   * @example "models"
   */
  modelPackage?: string;
}

/**
 * Additional properties for the `typescript-fetch` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptFetchClientCodegen.java
 */
export interface TypeScriptFetchAdditionalProperties
  extends TypeScriptCommonAdditionalProperties {
  /** Emit ES6 import/export syntax. @default true */
  supportsES6?: boolean;
}

/**
 * Additional properties shared by Java-based API client generators
 * (`java`, `jaxrs-cxf-client`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/JavaClientCodegen.java
 */
export interface JavaAdditionalProperties {
  /** Package for generated API classes. @example "com.example.api" */
  apiPackage?: string;
  /** Package for generated model classes. @example "com.example.model" */
  modelPackage?: string;
  /** Package for generated invoker/client infrastructure. @example "com.example.client" */
  invokerPackage?: string;
  /** Maven groupId. @example "com.example" */
  groupId?: string;
  /** Maven artifactId. @example "my-api-client" */
  artifactId?: string;
  /** Maven artifact version. @default "1.0.0" */
  artifactVersion?: string;
  /**
   * HTTP client library. Common values: `"okhttp-gson"`, `"retrofit2"`,
   * `"feign"`, `"resttemplate"`.
   */
  library?: string;
  /** Use Java 8 date/time types (`LocalDate`, `OffsetDateTime`). @default false */
  java8?: boolean;
  /** Annotate models with JSR-303 Bean Validation annotations. @default false */
  useBeanValidation?: boolean;
  /** Date library. Common values: `"java8"`, `"threetenbp"`, `"legacy"`. */
  dateLibrary?: string;
}

/**
 * Additional properties for Spring and related Java server-stub generators
 * (`spring`, `jaxrs-*`, `java-vertx`, `micronaut`, `inflector`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/SpringCodegen.java
 */
export interface SpringAdditionalProperties extends JavaAdditionalProperties {
  /** Generate interfaces instead of concrete controller classes. @default false */
  interfaceOnly?: boolean;
  /** Apply the delegator pattern to generated controllers. @default false */
  delegatePattern?: boolean;
  /** Target Spring WebFlux (reactive) instead of Spring MVC. @default false */
  reactive?: boolean;
  /** Emit a complete Spring Boot application with a `main` class. @default false */
  generateSpringApplication?: boolean;
  /** Use constructor injection and wrap optional fields in `Optional<>`. @default false */
  useOptional?: boolean;
}

/**
 * Additional properties for C# / ASP.NET Core generators
 * (`csharp`, `csharp-dotnet2`, `aspnetcore`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/CSharpClientCodegen.java
 */
export interface CSharpAdditionalProperties {
  /** Root namespace for generated code. @example "MyCompany.Api" */
  packageName?: string;
  /** Package version. @default "1.0.0" */
  packageVersion?: string;
  /** .NET target framework. @example "net6.0" */
  targetFramework?: string;
  /** Emit nullable reference type annotations (C# 8+). @default false */
  nullableReferenceTypes?: boolean;
  /** Generate async controller action methods. @default true */
  asyncController?: boolean;
}

/**
 * Additional properties for Go generators (`go`, `go-server`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/GoClientCodegen.java
 */
export interface GoAdditionalProperties {
  /** Go module package name. @example "github.com/myorg/myapi" */
  packageName?: string;
  /** Emit a `go.mod` file. @default true */
  generateGoMod?: boolean;
}

/**
 * Additional properties for Python generators (`python`, `python-flask`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/PythonClientCodegen.java
 */
export interface PythonAdditionalProperties {
  /** Python package name. @example "my_api_client" */
  packageName?: string;
  /** Python package version. @default "1.0.0" */
  packageVersion?: string;
  /** Project name shown in `setup.py`. */
  projectName?: string;
}

/**
 * Additional properties for the `php` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/PhpClientCodegen.java
 */
export interface PhpAdditionalProperties {
  /** Packagist package name. @example "myorg/myapi" */
  packageName?: string;
  /** Invoker namespace (PSR-4). @example "MyOrg\\MyApi" */
  invokerPackage?: string;
  /** Package version. @default "1.0.0" */
  artifactVersion?: string;
}

/**
 * Additional properties for Kotlin generators (`kotlin-client`, `kotlin-server`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/KotlinClientCodegen.java
 */
export interface KotlinAdditionalProperties {
  /** Root package name. @example "com.example.api" */
  packageName?: string;
  /** HTTP client library. Common values: `"jvm-okhttp4"`, `"multiplatform"`. */
  library?: string;
}

/**
 * Additional properties for Swift generators (`swift3`, `swift4`, `swift5`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/Swift5Codegen.java
 */
export interface SwiftAdditionalProperties {
  /** Swift project / module name. @example "MyApiClient" */
  projectName?: string;
  /** Response library. Common values: `"combine"`, `"rxSwift"`, `"promiseKit"`. */
  responseAs?: string;
  /** Use URLSession instead of Alamofire. @default false */
  useURLSession?: boolean;
}

/**
 * Additional properties for the `ruby` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/RubyClientCodegen.java
 */
export interface RubyAdditionalProperties {
  /** Ruby gem name. @example "my_api_client" */
  gemName?: string;
  /** Ruby module name. @example "MyApiClient" */
  moduleName?: string;
  /** Gem version. @default "1.0.0" */
  gemVersion?: string;
}

/**
 * Additional properties for the `nodejs-server` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/NodeJSServerCodegen.java
 */
export interface NodeJsAdditionalProperties {
  /** npm package name. @example "my-api-server" */
  npmName?: string;
  /** npm package version. @default "1.0.0" */
  npmVersion?: string;
}

/**
 * Additional properties for the `dart` generator.
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/DartClientCodegen.java
 */
export interface DartAdditionalProperties {
  /** Dart package name. @example "my_api_client" */
  pubName?: string;
  /** Dart package author. */
  pubAuthor?: string;
  /** pub.dev homepage URL. */
  pubHomepage?: string;
}

/**
 * Additional properties for Scala generators (`scala`, `scala-akka-http-server`).
 * @see https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/ScalaClientCodegen.java
 */
export interface ScalaAdditionalProperties {
  /** Model package name. @example "com.example.model" */
  modelPackage?: string;
  /** Main class name. @example "MyApiClient" */
  mainClassName?: string;
}

/** Fallback for generators whose properties are not yet enumerated. */
export type GenericAdditionalProperties = Record<string, string | boolean | number>;

// ─── Generate options — discriminated union ───────────────────────────────────

/** Options shared by every `generate` configuration. */
export interface BaseGenerateOptions {
  /**
   * URL or local path of the Swagger / OpenAPI specification.
   * @example "https://api.example.com/docs-json"
   * @example "./openapi.yaml"
   */
  inputSpec: string;
  /**
   * Path to a JSON file for additional-properties (`-c` flag).
   * When set the runner writes `additionalProperties` here and passes it to
   * the CLI instead of using inline `--additional-properties`.
   */
  configFilePath?: string;
  /** Path to a custom Mustache template directory (`-t` flag). */
  templateDir?: string;
  /**
   * Comma-separated list of model names to generate selectively.
   * @example "Pet,User"
   */
  models?: string;
  /**
   * Comma-separated list of API operation tags to generate selectively.
   * @example "pet,user"
   */
  apis?: string;
  /**
   * JVM system properties passed as `-D` flags.
   * @example { "io.swagger.parser.util.RemoteUrl.trustAll": "true" }
   */
  systemProperties?: Record<string, string>;
  /**
   * Directory where codegen writes its output, relative to `swaggerCodegenDir`
   * (local Java) or inside the Docker `/local/` volume mount.
   * @default "samples/client/output"
   */
  outputDir?: string;
}

export interface TypeScriptAngularGenerateOptions extends BaseGenerateOptions {
  language: "typescript-angular";
  additionalProperties?: TypeScriptAngularAdditionalProperties;
}
export interface TypeScriptAxiosGenerateOptions extends BaseGenerateOptions {
  language: "typescript-axios";
  additionalProperties?: TypeScriptAxiosAdditionalProperties;
}
export interface TypeScriptFetchGenerateOptions extends BaseGenerateOptions {
  language: "typescript-fetch";
  additionalProperties?: TypeScriptFetchAdditionalProperties;
}
export interface JavaGenerateOptions extends BaseGenerateOptions {
  language: "java" | "jaxrs-cxf-client";
  additionalProperties?: JavaAdditionalProperties;
}
export interface SpringGenerateOptions extends BaseGenerateOptions {
  language:
    | "spring"
    | "jaxrs-cxf"
    | "jaxrs-cxf-cdi"
    | "jaxrs-di"
    | "jaxrs-jersey"
    | "jaxrs-resteasy"
    | "jaxrs-resteasy-eap"
    | "jaxrs-spec"
    | "java-vertx"
    | "micronaut"
    | "inflector";
  additionalProperties?: SpringAdditionalProperties;
}
export interface CSharpGenerateOptions extends BaseGenerateOptions {
  language: "csharp" | "csharp-dotnet2" | "aspnetcore";
  additionalProperties?: CSharpAdditionalProperties;
}
export interface GoGenerateOptions extends BaseGenerateOptions {
  language: "go" | "go-server";
  additionalProperties?: GoAdditionalProperties;
}
export interface PythonGenerateOptions extends BaseGenerateOptions {
  language: "python" | "python-flask";
  additionalProperties?: PythonAdditionalProperties;
}
export interface PhpGenerateOptions extends BaseGenerateOptions {
  language: "php";
  additionalProperties?: PhpAdditionalProperties;
}
export interface KotlinGenerateOptions extends BaseGenerateOptions {
  language: "kotlin-client" | "kotlin-server";
  additionalProperties?: KotlinAdditionalProperties;
}
export interface SwiftGenerateOptions extends BaseGenerateOptions {
  language: "swift3" | "swift4" | "swift5";
  additionalProperties?: SwiftAdditionalProperties;
}
export interface RubyGenerateOptions extends BaseGenerateOptions {
  language: "ruby";
  additionalProperties?: RubyAdditionalProperties;
}
export interface NodeJsGenerateOptions extends BaseGenerateOptions {
  language: "nodejs-server";
  additionalProperties?: NodeJsAdditionalProperties;
}
export interface DartGenerateOptions extends BaseGenerateOptions {
  language: "dart";
  additionalProperties?: DartAdditionalProperties;
}
export interface ScalaGenerateOptions extends BaseGenerateOptions {
  language: "scala" | "scala-akka-http-server";
  additionalProperties?: ScalaAdditionalProperties;
}
export interface DocumentationGenerateOptions extends BaseGenerateOptions {
  language: DocumentationLanguage;
  additionalProperties?: never;
}
export interface GenericGenerateOptions extends BaseGenerateOptions {
  language: "javascript" | "r";
  additionalProperties?: GenericAdditionalProperties;
}

/**
 * Full discriminated union of generate options.
 * TypeScript narrows `additionalProperties` automatically once `language` is set.
 */
export type CodegenGenerateOptions =
  | TypeScriptAngularGenerateOptions
  | TypeScriptAxiosGenerateOptions
  | TypeScriptFetchGenerateOptions
  | JavaGenerateOptions
  | SpringGenerateOptions
  | CSharpGenerateOptions
  | GoGenerateOptions
  | PythonGenerateOptions
  | PhpGenerateOptions
  | KotlinGenerateOptions
  | SwiftGenerateOptions
  | RubyGenerateOptions
  | NodeJsGenerateOptions
  | DartGenerateOptions
  | ScalaGenerateOptions
  | DocumentationGenerateOptions
  | GenericGenerateOptions;

// ─── Top-level Config ─────────────────────────────────────────────────────────

export interface DownloadSpecConfig {
  /**
   * URL to fetch the spec from before running codegen.
   * @example "http://localhost:3000/docs-json"
   */
  url: string;
  /**
   * Local path where the downloaded spec is saved.
   * The saved file is then used as `generate.inputSpec`.
   * @default "./swagger.json"
   */
  outputPath?: string;
  /**
   * When `true`, the runner throws if the download fails.
   * When `false`, it logs a warning and falls back to `generate.inputSpec`.
   * @default true
   */
  required?: boolean;
}

/**
 * A single copy rule that maps a sub-directory of the codegen output to a
 * destination inside `projectDir`.
 *
 * @example
 * // Copy only the generated models into src/app/shared/dto
 * { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" }
 *
 * @example
 * // Copy the generated API services into a separate folder
 * { sourceSubPath: "api", destinationRelativePath: "src/app/services/api" }
 */
export interface CopyRule {
  /**
   * Subdirectory inside the generated output to copy from.
   * When omitted the entire generated output directory is copied.
   * @example "model"
   * @example "api"
   */
  sourceSubPath?: string;

  /**
   * Relative path inside `projectDir` to copy into.
   * @example "src/app/shared/dto"
   */
  destinationRelativePath: string;

  /**
   * When `true`, empties this destination before copying.
   * Falls back to `Config.cleanDestinationBeforeCopy` when omitted.
   */
  cleanDestinationBeforeCopy?: boolean;
}

export interface Config {
  /**
   * Absolute path to the swagger-codegen repository root (where the JAR lives).
   * Required when `useDocker` is `false`.
   * @example "/home/user/tools/swagger-codegen"
   */
  swaggerCodegenDir: string;

  /**
   * Absolute path to the destination project root.
   * Generated files are copied here after codegen completes.
   */
  projectDir: string;

  /**
   * Relative path inside `projectDir` where the generated output is copied.
   * The runner copies the entire codegen output directory to this location.
   *
   * Use `copyRules` instead when you need granular control over which
   * sub-directories are copied and where they land.
   *
   * @example "src/app/shared/dto"   (Angular DTOs)
   * @example "src/generated"        (generic)
   * @example "docs/api"             (documentation)
   */
  outputDestinationRelativePath?: string;

  /**
   * Granular copy rules. Each rule maps a sub-directory of the generated output
   * to a destination inside `projectDir`.
   *
   * When set, `copyRules` takes precedence over `outputDestinationRelativePath`.
   *
   * @example
   * copyRules: [
   *   { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" },
   *   { sourceSubPath: "api",   destinationRelativePath: "src/app/services/api" },
   * ]
   */
  copyRules?: CopyRule[];

  /**
   * When `true`, empties the destination folder before copying new files.
   * Can be overridden per rule via `CopyRule.cleanDestinationBeforeCopy`.
   * @default true
   */
  cleanDestinationBeforeCopy?: boolean;

  /**
   * Run codegen via Docker instead of a local `java` installation.
   * @default false
   */
  useDocker?: boolean;

  /**
   * Docker image used when `useDocker` is `true`.
   * @default "swaggerapi/swagger-codegen-cli-v3:latest"
   */
  dockerImage?: string;

  /**
   * When provided, downloads the OpenAPI spec from the given URL and saves it
   * locally before running codegen. The saved file is used as `inputSpec`.
   *
   * Useful for local development servers or when you want to snapshot the spec
   * for offline use or version-tracking.
   */
  downloadSpec?: DownloadSpecConfig;

  /**
   * Options forwarded to the `generate` command.
   * Setting `language` narrows `additionalProperties` to the correct type.
   */
  generate: CodegenGenerateOptions;
}
