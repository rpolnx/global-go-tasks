import * as fs from "fs";
import * as path from "path";
import { exec as execCb } from "child_process";

import { promisify } from "util";

function getFileLines(filePath: string): string[] {
  try {
    return fs.readFileSync(filePath, "utf-8").split("\n");
  } catch {
    return [];
  }
}

function getTestFilePath(originalPath: string): string {
  const parsed = path.parse(originalPath);
  return path.join(parsed.dir, `${parsed.name}_test${parsed.ext}`);
}

const exec = promisify(execCb);

async function waitForFile(
  filePath: string,
  retries = 10,
  delay = 100
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return;
    } catch {
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error(`File not found: ${filePath}`);
}

export { getFileLines, getTestFilePath, exec, waitForFile };
