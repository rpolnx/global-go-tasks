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

function waitForFile(filePath: string, retries = 10, delay = 100): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = () => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) return resolve();
        if (retries <= 0) return reject(new Error(`File not found: ${filePath}`));
        setTimeout(() => {
          retries--;
          check();
        }, delay);
      });
    };
    check();
  });
}


export { getFileLines, getTestFilePath, exec, waitForFile };
