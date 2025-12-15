import { Buffer } from 'buffer';
export declare class PdfService {
    private browser;
    init(): Promise<void>;
    generatePdf(html: string): Promise<Buffer>;
    close(): Promise<void>;
}
export declare const pdfService: PdfService;
