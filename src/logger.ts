/**
 * @file logger.ts
 * Minimal timestamped logger used throughout swagger-codegen-runner.
 */

export function log(message: string): void {
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
  console.log(`[${ts}] ${message}`);
}

export function warn(message: string): void {
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
  console.warn(`[${ts}] WARNING: ${message}`);
}

export function errorExit(message: string): never {
  const ts = new Date().toISOString().replace("T", " ").substring(0, 19);
  console.error(`[${ts}] ERROR: ${message}`);
  process.exit(1);
}
