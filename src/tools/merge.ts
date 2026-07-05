import { readFile, writeFile } from "fs/promises";
import { PDFDocument } from "pdf-lib";
import { resolveSafePath, assertFileExists } from "../lib/paths.js";

export interface MergeInput {
  files: string[];   // absolute paths to input PDFs
  output: string;    // absolute path for the output PDF
}

export async function mergePdf(input: MergeInput): Promise<string> {
  const merged = await PDFDocument.create();
  const resolvedFiles: string[] = [];

  for (const filePath of input.files) {
    const resolvedPath = resolveSafePath(filePath);
    await assertFileExists(resolvedPath);
    resolvedFiles.push(resolvedPath);
  }

  for (const resolvedPath of resolvedFiles) {
    const bytes = await readFile(resolvedPath);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outputBytes = await merged.save();
  const resolvedOutput = resolveSafePath(input.output);
  await writeFile(resolvedOutput, outputBytes);

  return `Merged ${input.files.length} PDFs → ${resolvedOutput}`;
}