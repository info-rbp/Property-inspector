import { chromium, Browser } from 'playwright';
import { AppError } from '../utils/errors';
import { Buffer } from 'buffer';

export class PdfService {
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
      console.log('Playwright browser launched');
    }
  }

  async generatePdf(html: string): Promise<Buffer> {
    if (!this.browser) await this.init();
    
    const context = await this.browser!.newContext();
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
    } catch (err) {
      console.error('PDF Generation Error', err);
      throw new AppError('PDF_GENERATION_FAILED', 'Failed to render PDF', 500);
    } finally {
      await page.close();
      await context.close();
    }
  }
  
  async close() {
    if (this.browser) await this.browser.close();
  }
}

export const pdfService = new PdfService();