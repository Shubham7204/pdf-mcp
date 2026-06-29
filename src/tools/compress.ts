import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export type CompressionQuality = "low" | "medium" | "high";

export interface CompressInput {
  file: string;
  output: string;
  quality?: CompressionQuality;  // defaults to "medium"
}

const qualityMap: Record<CompressionQuality, { objectStreams: string; compressStreams: string; decodeLevel: string }> = {
  low: { objectStreams: "generate", compressStreams: "y", decodeLevel: "generalized" },
  medium: { objectStreams: "generate", compressStreams: "y", decodeLevel: "generalized" },
  high: { objectStreams: "preserve", compressStreams: "y", decodeLevel: "generalized" },
};

export async function compressPdf(input: CompressInput): Promise<string> {
  const quality = input.quality ?? "medium";
  const options = qualityMap[quality];
  const inputPath = path.resolve(input.file);
  const outputPath = path.resolve(input.output);

  try {
    await execFileAsync("qpdf", [
      `--object-streams=${options.objectStreams}`,
      `--compress-streams=${options.compressStreams}`,
      `--decode-level=${options.decodeLevel}`,
      inputPath,
      outputPath,
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to compress PDF: ${message}`);
  }

  return `Compressed ${input.file} (quality: ${quality}) → ${outputPath}`;
}