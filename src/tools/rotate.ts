import { readFile, writeFile } from "fs/promises";
import { PDFDocument, degrees } from "pdf-lib";
import { resolveSafePath, assertFileExists } from "../lib/paths.js";

export interface RotateInput {
  file: string;
  output: string;
  pages: number[];
  angle: 90 | 180 | 270;
}

export async function rotatePdf(input: RotateInput): Promise<string> {
  const resolvedPath = resolveSafePath(input.file);
  await assertFileExists(resolvedPath);

  try {
    const bytes = await readFile(resolvedPath);
    const doc = await PDFDocument.load(bytes);
    const pageCount = doc.getPageCount();

    for (const p of input.pages) {
      const index = p - 1;
      if (index < 0 || index >= pageCount) {
        throw new Error(`Page index ${p} is out of bounds (1-${pageCount})`);
      }
      const page = doc.getPage(index);
      page.setRotation(degrees(input.angle));
    }

    const outputBytes = await doc.save();
    const resolvedOutput = resolveSafePath(input.output);
    await writeFile(resolvedOutput, outputBytes);

    return `Rotated pages [${input.pages.join(", ")}] by ${input.angle} degrees in ${input.file} → ${resolvedOutput}`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to rotate PDF pages: ${message}`);
  }
}
