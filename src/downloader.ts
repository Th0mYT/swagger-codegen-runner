/**
 * @file downloader.ts
 * Downloads an OpenAPI / Swagger spec from a URL and saves it locally.
 * Supports both http:// and https://, and follows HTTP 3xx redirects.
 * Uses only Node.js built-in modules — no extra dependencies.
 */

import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";
import { log } from "./logger";

const TIMEOUT_MS = 15_000;

/**
 * Downloads the spec at `url`, writes it to `outputPath`, and returns the
 * resolved absolute path of the saved file.
 *
 * @param url        HTTP or HTTPS URL of the spec endpoint.
 * @param outputPath Local file path where the spec will be saved.
 */
export function downloadSpec(url: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https://");
    const client  = isHttps ? https : http;
    const absPath = path.resolve(outputPath);

    log(`Downloading spec from: ${url}`);

    const request = client.get(url, (res) => {
      // Follow redirects (3xx)
      if (
        res.statusCode &&
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        log(`Redirecting to: ${res.headers.location}`);
        downloadSpec(res.headers.location, outputPath).then(resolve).catch(reject);
        return;
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`HTTP ${res.statusCode} while downloading spec from: ${url}`));
        return;
      }

      const dir = path.dirname(absPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const file = fs.createWriteStream(absPath);
      res.pipe(file);

      file.on("finish", () => {
        file.close();
        log(`Spec saved to: ${absPath}`);
        resolve(absPath);
      });

      file.on("error", (err) => {
        fs.rmSync(absPath, { force: true });
        reject(err);
      });
    });

    request.on("error", reject);

    request.setTimeout(TIMEOUT_MS, () => {
      request.destroy(
        new Error(`Timeout (${TIMEOUT_MS}ms) downloading spec from: ${url}`)
      );
    });
  });
}
