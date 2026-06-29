import { readFile, writeFile } from "fs/promises";
import { PDFDocument } from "pdf-lib";
import path from "path";

export interface MergeInput {
  files: string[];   // absolute paths to input PDFs
  output: string;    // absolute path for the output PDF
}

export async function mergePdf(input: MergeInput): Promise<string> {
  const merged = await PDFDocument.create();

  for (const filePath of input.files) {
    const bytes = await readFile(filePath);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outputBytes = await merged.save();
  const resolvedOutput = path.resolve(input.output);
  await writeFile(resolvedOutput, outputBytes);

  return `Merged ${input.files.length} PDFs → ${resolvedOutput}`;
}