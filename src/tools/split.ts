import { readFile, writeFile } from "fs/promises";
import { PDFDocument } from "pdf-lib";
import path from "path";

export interface SplitInput {
  file: string;        // input PDF path
  pages: number[];     // 1-indexed page numbers to extract
  output: string;      // output PDF path
}

export async function splitPdf(input: SplitInput): Promise<string> {
  const bytes = await readFile(input.file);
  const srcDoc = await PDFDocument.load(bytes);
  const newDoc = await PDFDocument.create();

  // Convert 1-indexed to 0-indexed
  const indices = input.pages.map((p) => p - 1);
  const copied = await newDoc.copyPages(srcDoc, indices);
  copied.forEach((page) => newDoc.addPage(page));

  const outputBytes = await newDoc.save();
  const resolvedOutput = path.resolve(input.output);
  await writeFile(resolvedOutput, outputBytes);

  return `Extracted pages [${input.pages.join(", ")}] from ${input.file} → ${resolvedOutput}`;
}