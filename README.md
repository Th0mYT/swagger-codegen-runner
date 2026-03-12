# swagger-codegen-runner

[![npm version](https://img.shields.io/npm/v/swagger-codegen-runner)](https://www.npmjs.com/package/swagger-codegen-runner)
[![CI](https://github.com/Th0mYT/swagger-codegen-runner/actions/workflows/ci.yml/badge.svg)](https://github.com/Th0mYT/swagger-codegen-runner/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A fully-typed TypeScript library for running **swagger-codegen-cli v3**.

- ✅ Supports all generators — API clients, server stubs, documentation
- ✅ Full **IntelliSense** for `additionalProperties` — each generator has its own typed interface
- ✅ **Granular copy rules** — copy specific sub-directories of the output to different destinations
- ✅ Optional **spec download** from a local or remote server before codegen
- ✅ Works with **Docker** or a local **Java** installation
- ✅ Zero runtime dependencies — only Node.js built-ins

---

## Prerequisites

| Mode | Requirement |
|---|---|
| Local Java | Java 8+ in `PATH` |
| Docker | Docker Desktop or daemon running |

swagger-codegen-cli v3 itself is **not** bundled — you need either:
- A local clone/build of [swagger-api/swagger-codegen](https://github.com/swagger-api/swagger-codegen) (local Java mode)
- Docker (the image is pulled automatically)

---

## Installation

```bash
npm install swagger-codegen-runner
# or
yarn add swagger-codegen-runner
```

---

## Quick Start

```typescript
import { run, type Config } from "swagger-codegen-runner";

const config: Config = {
  swaggerCodegenDir: "/path/to/swagger-codegen",
  projectDir: "/path/to/my-project",
  outputDestinationRelativePath: "src/app/shared/dto",

  generate: {
    language: "typescript-angular",
    inputSpec: "https://api.example.com/docs-json",
    additionalProperties: {
      ngVersion: "19",
      withInterfaces: false,
      modelPropertyNaming: "camelCase",
    },
  },
};

await run(config);
```

---

## Configuration Reference

### `Config`

| Field | Type | Default | Description |
|---|---|---|---|
| `swaggerCodegenDir` | `string` | **required** | Absolute path to the swagger-codegen repo root (JAR location). Not needed in Docker mode. |
| `projectDir` | `string` | **required** | Absolute path to the destination project root. |
| `outputDestinationRelativePath` | `string` | `undefined` | Relative path inside `projectDir` where the entire output is copied. Skips copy if omitted. Ignored when `copyRules` is set. |
| `copyRules` | [`CopyRule[]`](#copyrule) | `undefined` | Granular copy rules. Takes precedence over `outputDestinationRelativePath`. |
| `cleanDestinationBeforeCopy` | `boolean` | `true` | Empty the destination folder(s) before copying. Can be overridden per rule. |
| `useDocker` | `boolean` | `false` | Run via Docker instead of local Java. |
| `dockerImage` | `string` | `swaggerapi/swagger-codegen-cli-v3:latest` | Docker image to use. |
| `downloadSpec` | [`DownloadSpecConfig`](#downloadspecconfig) | `undefined` | Download the spec before codegen. |
| `generate` | [`CodegenGenerateOptions`](#codegengenerateoptions) | **required** | Options forwarded to the `generate` command. |

### `CopyRule`

Each rule copies a specific sub-directory of the generated output to a destination inside `projectDir`. Useful when you only want a subset of the output (e.g. just `model/`) or want to scatter different parts into separate locations.

| Field | Type | Default | Description |
|---|---|---|---|
| `sourceSubPath` | `string` | `undefined` | Sub-directory inside the generated output to copy from. Copies the entire output when omitted. |
| `destinationRelativePath` | `string` | **required** | Relative path inside `projectDir` to copy into. |
| `cleanDestinationBeforeCopy` | `boolean` | *(inherits)* | Override the top-level `cleanDestinationBeforeCopy` for this rule only. |

**Example — copy only models:**

```typescript
copyRules: [
  { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" },
]
```

**Example — split models and API services into separate folders:**

```typescript
copyRules: [
  { sourceSubPath: "model", destinationRelativePath: "src/app/shared/dto" },
  { sourceSubPath: "api",   destinationRelativePath: "src/app/services/api" },
]
```

### `DownloadSpecConfig`

| Field | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | **required** | URL to fetch the spec from (http or https). |
| `outputPath` | `string` | `./swagger.json` | Local path where the spec is saved. |
| `required` | `boolean` | `true` | Fail on download error (`true`) or fall back to `inputSpec` (`false`). |

### `CodegenGenerateOptions` (common fields)

These fields apply to **every** generator.

| Field | Type | Default | Description |
|---|---|---|---|
| `language` | [`CodegenLanguage`](#supported-generators) | **required** | Target generator. |
| `inputSpec` | `string` | **required** | URL or local path to the spec file. |
| `outputDir` | `string` | `samples/client/output` | Output path relative to `swaggerCodegenDir`. |
| `configFilePath` | `string` | `undefined` | Write `additionalProperties` to this JSON file and use `-c` instead of inline flags. |
| `templateDir` | `string` | `undefined` | Custom Mustache template directory (`-t` flag). |
| `models` | `string` | `undefined` | Comma-separated list of model names to generate. |
| `apis` | `string` | `undefined` | Comma-separated list of API operation tags to generate. |
| `systemProperties` | `Record<string, string>` | `undefined` | JVM `-D` flags (e.g. `{ "io.swagger.parser.util.RemoteUrl.trustAll": "true" }`). |
| `additionalProperties` | *(generator-specific)* | `undefined` | Options specific to the chosen generator. See below. |

---

## Supported Generators

Setting `generate.language` narrows `additionalProperties` to the typed interface for that generator.

### API Clients

| Language | `additionalProperties` interface | Docs |
|---|---|---|
| `typescript-angular` | [`TypeScriptAngularAdditionalProperties`](#typescript-angular) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptAngularClientCodegen.java) |
| `typescript-axios` | [`TypeScriptAxiosAdditionalProperties`](#typescript-axios) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptAxiosClientCodegen.java) |
| `typescript-fetch` | [`TypeScriptFetchAdditionalProperties`](#typescript-fetch) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/TypeScriptFetchClientCodegen.java) |
| `java` / `jaxrs-cxf-client` | [`JavaAdditionalProperties`](#java) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/JavaClientCodegen.java) |
| `csharp` / `csharp-dotnet2` | [`CSharpAdditionalProperties`](#csharp--aspnetcore) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/CSharpClientCodegen.java) |
| `go` | [`GoAdditionalProperties`](#go--go-server) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/GoClientCodegen.java) |
| `python` | [`PythonAdditionalProperties`](#python--python-flask) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/PythonClientCodegen.java) |
| `php` | [`PhpAdditionalProperties`](#php) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/PhpClientCodegen.java) |
| `kotlin-client` | [`KotlinAdditionalProperties`](#kotlin) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/KotlinClientCodegen.java) |
| `swift3` / `swift4` / `swift5` | [`SwiftAdditionalProperties`](#swift) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/Swift5Codegen.java) |
| `ruby` | [`RubyAdditionalProperties`](#ruby) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/RubyClientCodegen.java) |
| `dart` | [`DartAdditionalProperties`](#dart) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/DartClientCodegen.java) |
| `scala` | [`ScalaAdditionalProperties`](#scala) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/ScalaClientCodegen.java) |
| `javascript` / `r` | `Record<string, string\|boolean\|number>` | — |

### Server Stubs

| Language | `additionalProperties` interface | Docs |
|---|---|---|
| `spring` / `jaxrs-*` / `java-vertx` / `micronaut` / `inflector` | [`SpringAdditionalProperties`](#spring--jaxrs--micronaut) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/SpringCodegen.java) |
| `aspnetcore` | [`CSharpAdditionalProperties`](#csharp--aspnetcore) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/AspNetCoreServerCodegen.java) |
| `go-server` | [`GoAdditionalProperties`](#go--go-server) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/GoServerCodegen.java) |
| `python-flask` | [`PythonAdditionalProperties`](#python--python-flask) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/PythonFlaskConnexionServerCodegen.java) |
| `kotlin-server` | [`KotlinAdditionalProperties`](#kotlin) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/KotlinServerCodegen.java) |
| `nodejs-server` | [`NodeJsAdditionalProperties`](#nodejs-server) | [config-help](https://github.com/swagger-api/swagger-codegen/blob/master/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/NodeJSServerCodegen.java) |
| `scala-akka-http-server` | [`ScalaAdditionalProperties`](#scala) | — |

### Documentation

| Language | Notes |
|---|---|
| `html` / `html2` / `dynamic-html` | Static HTML documentation |
| `openapi` / `openapi-yaml` | Re-emit the spec as JSON or YAML |

Documentation generators do not accept `additionalProperties`.

---

## `additionalProperties` per Generator

> For the complete and up-to-date list of options for any generator, run:
> ```bash
> java -jar swagger-codegen-cli.jar config-help -l <language>
> ```

### `typescript-angular`

| Property | Type | Default | Description |
|---|---|---|---|
| `ngVersion` | `string` | `"4.3"` | Angular version. Controls HttpClient, RxJS API, and module format. |
| `withInterfaces` | `boolean` | `false` | Generate a TypeScript interface alongside each model class. |
| `taggedUnions` | `boolean` | `false` | Use discriminated unions for models with a `discriminator`. |
| `kebabFileNaming` | `boolean` | `false` | Use kebab-case file names (e.g. `my-model.ts`). |
| `modelPropertyNaming` | `"camelCase" \| "PascalCase" \| "snake_case" \| "original"` | `"camelCase"` | Naming convention for model properties. |
| `npmName` | `string` | — | Publish the generated code as this npm package name. |
| `npmVersion` | `string` | `"1.0.0"` | npm package version. |
| `npmRepository` | `string` | — | Private npm registry URL (set in `publishConfig`). |
| `snapshot` | `boolean` | `false` | Append a timestamp suffix to the version. |

See [example config →](examples/angular.config.ts)

### `typescript-axios`

| Property | Type | Default | Description |
|---|---|---|---|
| `withSeparateModelsAndApi` | `boolean` | `false` | Place APIs and models in separate sub-folders. |
| `apiPackage` | `string` | — | Sub-folder name for API classes (requires `withSeparateModelsAndApi`). |
| `modelPackage` | `string` | — | Sub-folder name for model classes (requires `withSeparateModelsAndApi`). |
| `modelPropertyNaming` | `"camelCase" \| "PascalCase" \| "snake_case" \| "original"` | `"camelCase"` | Naming convention for model properties. |
| `npmName` / `npmVersion` / `npmRepository` / `snapshot` | — | — | Same as `typescript-angular`. |

See [example config →](examples/axios.config.ts)

### `typescript-fetch`

| Property | Type | Default | Description |
|---|---|---|---|
| `supportsES6` | `boolean` | `true` | Emit ES6 import/export syntax. |
| `modelPropertyNaming` | `"camelCase" \| ...` | `"camelCase"` | Naming convention for model properties. |
| `npmName` / `npmVersion` / `npmRepository` / `snapshot` | — | — | Same as `typescript-angular`. |

### `java` / `jaxrs-cxf-client`

| Property | Type | Default | Description |
|---|---|---|---|
| `apiPackage` | `string` | — | Package for API classes. |
| `modelPackage` | `string` | — | Package for model classes. |
| `invokerPackage` | `string` | — | Package for invoker/infrastructure classes. |
| `groupId` / `artifactId` / `artifactVersion` | `string` | — | Maven coordinates. |
| `library` | `string` | — | HTTP client library (`"okhttp-gson"`, `"retrofit2"`, `"feign"`, `"resttemplate"`). |
| `java8` | `boolean` | `false` | Use Java 8 date/time types. |
| `useBeanValidation` | `boolean` | `false` | Add JSR-303 Bean Validation annotations. |
| `dateLibrary` | `string` | — | Date library (`"java8"`, `"threetenbp"`, `"legacy"`). |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l java`

### `spring` / `jaxrs-*` / `micronaut`

Extends all `java` properties, plus:

| Property | Type | Default | Description |
|---|---|---|---|
| `interfaceOnly` | `boolean` | `false` | Generate controller interfaces instead of concrete classes. |
| `delegatePattern` | `boolean` | `false` | Apply the delegator pattern to controllers. |
| `reactive` | `boolean` | `false` | Target Spring WebFlux instead of Spring MVC. |
| `generateSpringApplication` | `boolean` | `false` | Emit a complete Spring Boot application with `main`. |
| `useOptional` | `boolean` | `false` | Use constructor injection with `Optional<>`. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l spring`

### `csharp` / `aspnetcore`

| Property | Type | Default | Description |
|---|---|---|---|
| `packageName` | `string` | — | Root namespace. |
| `packageVersion` | `string` | `"1.0.0"` | Package version. |
| `targetFramework` | `string` | — | .NET target framework (e.g. `"net6.0"`). |
| `nullableReferenceTypes` | `boolean` | `false` | Enable nullable reference type annotations (C# 8+). |
| `asyncController` | `boolean` | `true` | Generate async action methods. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l csharp`

### `go` / `go-server`

| Property | Type | Default | Description |
|---|---|---|---|
| `packageName` | `string` | — | Go module package name. |
| `generateGoMod` | `boolean` | `true` | Emit a `go.mod` file. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l go`

### `python` / `python-flask`

| Property | Type | Default | Description |
|---|---|---|---|
| `packageName` | `string` | — | Python package name. |
| `packageVersion` | `string` | `"1.0.0"` | Package version. |
| `projectName` | `string` | — | Project name in `setup.py`. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l python`

### `php`

| Property | Type | Default | Description |
|---|---|---|---|
| `packageName` | `string` | — | Packagist name (e.g. `"myorg/myapi"`). |
| `invokerPackage` | `string` | — | PSR-4 namespace. |
| `artifactVersion` | `string` | `"1.0.0"` | Package version. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l php`

### `kotlin`

| Property | Type | Default | Description |
|---|---|---|---|
| `packageName` | `string` | — | Root package name. |
| `library` | `string` | — | HTTP client (`"jvm-okhttp4"`, `"multiplatform"`). |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l kotlin-client`

### `swift`

| Property | Type | Default | Description |
|---|---|---|---|
| `projectName` | `string` | — | Swift module name. |
| `responseAs` | `string` | — | Response library (`"combine"`, `"rxSwift"`, `"promiseKit"`). |
| `useURLSession` | `boolean` | `false` | Use URLSession instead of Alamofire. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l swift5`

### `ruby`

| Property | Type | Default | Description |
|---|---|---|---|
| `gemName` | `string` | — | Ruby gem name. |
| `moduleName` | `string` | — | Ruby module name. |
| `gemVersion` | `string` | `"1.0.0"` | Gem version. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l ruby`

### `nodejs-server`

| Property | Type | Default | Description |
|---|---|---|---|
| `npmName` | `string` | — | npm package name. |
| `npmVersion` | `string` | `"1.0.0"` | npm package version. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l nodejs-server`

### `dart`

| Property | Type | Default | Description |
|---|---|---|---|
| `pubName` | `string` | — | Dart package name. |
| `pubAuthor` | `string` | — | Package author. |
| `pubHomepage` | `string` | — | pub.dev homepage URL. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l dart`

### `scala`

| Property | Type | Default | Description |
|---|---|---|---|
| `modelPackage` | `string` | — | Model package name. |
| `mainClassName` | `string` | — | Main class name. |

> Full list: `java -jar swagger-codegen-cli.jar config-help -l scala`

---

## Release Workflow

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) and [Conventional Commits](https://www.conventionalcommits.org/).

```bash
# Patch release (bug fixes)
npm run release

# Minor release (new features)
npm run release:minor

# Major release (breaking changes)
npm run release:major
```

`standard-version` will automatically:
1. Bump the version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git commit and tag

Then push the tag to trigger the NPM publish GitHub Action:

```bash
git push --follow-tags origin main
```

---

## Contributing

Contributions are welcome. Please open an issue or PR on [GitHub](https://github.com/Th0mYT/swagger-codegen-runner).

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for dart generator options
fix: correct outputDir resolution in Docker mode
docs: update spring additionalProperties table
```

---

## License

[MIT](LICENSE)
