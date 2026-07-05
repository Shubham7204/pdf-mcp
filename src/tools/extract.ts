import { createWorker } from "tesseract.js";
import path from "path";
import { readFile, stat, writeFile } from "fs/promises";
import pdfParse from "pdf-parse";
import { resolveSafePath, assertFileExists } from "../lib/paths.js";

export interface ExtractInput {
  file: string;          // input PDF path
  output?: string;       // optional: write text to this file
}

export async function extractText(input: ExtractInput): Promise<string> {
  const resolvedPath = resolveSafePath(input.file);
  await assertFileExists(resolvedPath);

  const extension = path.extname(resolvedPath).toLowerCase();
  const text =
    extension === ".pdf"
      ? await extractPdfText(resolvedPath)
      : await extractImageText(resolvedPath);

  if (input.output) {
    const outputPath = resolveSafePath(input.output);
    await writeFile(outputPath, text, "utf8");
    return `Extracted ${text.length} characters -> ${outputPath}`;
  }

  return formatInlineText(text);
}

async function extractImageText(file: string): Promise<string> {
  const stats = await stat(file);
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (stats.size > maxSize) {
    throw new Error(`File size exceeds the 20MB limit for OCR recognition.`);
  }

  const worker = await createWorker("eng", 1, {
    errorHandler: () => {} // Intercept and prevent asynchronous process-level crashes
  });

  try {
    const result = await worker.recognize(file);
    const text = result.data.text.trim();
    if (!text) {
      throw new Error("No text could be extracted from the image.");
    }
    return text;
  } finally {
    await worker.terminate();
  }
}

async function extractPdfText(file: string): Promise<string> {
  const buffer = await readFile(file);
  const data = await pdfParse(buffer);
  const text = String(data.text || "").trim();
  if (!text) {
    throw new Error(
      "No embedded text was found in this PDF. It may be scanned; OCR for scanned PDFs needs a PDF-to-image renderer before Tesseract can read it."
    );
  }

  return text;
}

function formatInlineText(text: string): string {
  return text.length > 2000
    ? text.slice(0, 2000) + `\n\n... [truncated, ${text.length} total chars]`
    : text;
}
