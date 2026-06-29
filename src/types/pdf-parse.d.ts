declare module "pdf-parse" {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    version: string;
    text: string;
  }

  function pdfParse(data: Buffer | Uint8Array | string): Promise<PdfParseResult>;

  export default pdfParse;
}
