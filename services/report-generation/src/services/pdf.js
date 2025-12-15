"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfService = exports.PdfService = void 0;
const playwright_1 = require("playwright");
const errors_1 = require("../utils/errors");
class PdfService {
    browser = null;
    async init() {
        if (!this.browser) {
            this.browser = await playwright_1.chromium.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
            });
            console.log('Playwright browser launched');
        }
    }
    async generatePdf(html) {
        if (!this.browser)
            await this.init();
        const context = await this.browser.newContext();
        const page = await context.newPage();
        try {
            // Set content
            await page.setContent(html, { waitUntil: 'networkidle' });
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0px',
                    bottom: '0px',
                    left: '0px',
                    right: '0px',
                },
            });
            return pdfBuffer;
        }
        catch (err) {
            console.error('PDF Generation Error', err);
            throw new errors_1.AppError('PDF_GENERATION_FAILED', 'Failed to render PDF', 500);
        }
        finally {
            await page.close();
            await context.close();
        }
    }
    async close() {
        if (this.browser)
            await this.browser.close();
    }
}
exports.PdfService = PdfService;
exports.pdfService = new PdfService();
