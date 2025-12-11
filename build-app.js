import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the complete HTML application
const htmlPath = join(process.cwd(), 'public', 'index.html');
const htmlContent = readFileSync(htmlPath, 'utf-8');

// Escape backticks and dollar signs for template literals
const escapedHtml = htmlContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

// Create the updated index.tsx with embedded HTML
const serverCode = `import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Bindings = {
  GEMINI_API_KEY: string
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// The full React application HTML
const APP_HTML = \`${escapedHtml}\`;

// Initialize Gemini AI with hardcoded API key for development
const GEMINI_API_KEY = 'AIzaSyB1eta3AGLBi5exnNLV3HbqBVRm1bCl3gs';
let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini when needed
const getGenAI = (apiKey: string) => {
  if (!genAI || apiKey !== GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', service: 'inspection-platform' });
});

// Save report
app.post('/api/reports/save', async (c) => {
  try {
    const report = await c.req.json();
    const { KV } = c.env;
    
    const key = \`report:\${report.id}\`;
    await KV.put(key, JSON.stringify(report));
    
    // Update report list
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    
    const existingIndex = reports.findIndex((r: any) => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = {
        id: report.id,
        propertyAddress: report.propertyAddress,
        type: report.type,
        tenantName: report.tenantName,
        inspectionDate: report.inspectionDate
      };
    } else {
      reports.push({
        id: report.id,
        propertyAddress: report.propertyAddress,
        type: report.type,
        tenantName: report.tenantName,
        inspectionDate: report.inspectionDate
      });
    }
    
    await KV.put(listKey, JSON.stringify(reports));
    
    return c.json({ success: true, id: report.id });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Load all reports
app.get('/api/reports', async (c) => {
  try {
    const { KV } = c.env;
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    
    // Fetch full report data
    const fullReports = await Promise.all(
      reports.map(async (meta: any) => {
        const reportData = await KV.get(\`report:\${meta.id}\`);
        return reportData ? JSON.parse(reportData) : meta;
      })
    );
    
    return c.json(fullReports);
  } catch (error) {
    return c.json([]);
  }
});

// Delete report
app.delete('/api/reports/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { KV } = c.env;
    
    // Delete report data
    await KV.delete(\`report:\${id}\`);
    
    // Update list
    const listKey = 'reports:list';
    const existingList = await KV.get(listKey);
    const reports = existingList ? JSON.parse(existingList) : [];
    const filtered = reports.filter((r: any) => r.id !== id);
    await KV.put(listKey, JSON.stringify(filtered));
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Gemini AI Analysis Endpoint
app.post('/api/gemini/analyze', async (c) => {
  try {
    const { image, roomType, existingComment } = await c.req.json();
    
    // Use hardcoded API key if environment variable not set
    const apiKey = c.env.GEMINI_API_KEY || GEMINI_API_KEY;
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    // Remove data URL prefix
    const base64Data = image.replace(/^data:image\\/[a-z]+;base64,/, '');
    
    const prompt = \`You are a professional property inspector conducting a \${roomType} inspection.
    
Analyze this photo and provide:
1. Overall room condition (2-3 sentences)
2. For each standard item, assess:
   - Walls: Clean/Undamaged/Working status and any issues
   - Ceiling: Clean/Undamaged/Working status and any issues
   - Flooring: Clean/Undamaged/Working status and any issues
   - Windows: Clean/Undamaged/Working status and any issues
   - Light Fittings: Clean/Undamaged/Working status and any issues
   - Power Points: Clean/Undamaged/Working status and any issues

Focus on visible defects, damage, or maintenance issues. Be concise and professional.
Use Australian English spelling (e.g., colour not color).

Return response in this JSON format:
{
  "overallComment": "Overall room assessment here",
  "items": {
    "Walls": {
      "isClean": true/false,
      "isUndamaged": true/false, 
      "isWorking": true/false,
      "comment": "Specific observations"
    },
    "Ceiling": { ... },
    "Flooring": { ... },
    "Windows": { ... },
    "Light Fittings": { ... },
    "Power Points": { ... }
  }
}\`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      const analysisResult = JSON.parse(jsonMatch[0]);
      return c.json({
        success: true,
        ...analysisResult
      });
    }
    
    return c.json({
      success: true,
      overallComment: text,
      items: {}
    });
    
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return c.json({
      success: false,
      error: String(error),
      overallComment: '',
      items: {}
    });
  }
});

// Test Gemini connection
app.get('/api/gemini/test', async (c) => {
  try {
    const apiKey = c.env.GEMINI_API_KEY || GEMINI_API_KEY;
    const ai = getGenAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const result = await model.generateContent('Say "API Connected Successfully"');
    const response = await result.response;
    const text = response.text();
    
    return c.json({
      success: true,
      message: text,
      model: 'gemini-2.0-flash-exp'
    });
  } catch (error) {
    return c.json({
      success: false,
      error: String(error)
    }, 500);
  }
});

// Serve the main application
app.get('/', (c) => {
  return c.html(APP_HTML);
});

// Catch all routes - return the app
app.get('*', (c) => {
  return c.html(APP_HTML);
});

export default app`;

// Write the updated server file
const serverPath = join(process.cwd(), 'src', 'index.tsx');
writeFileSync(serverPath, serverCode);

console.log('✅ Server updated with embedded HTML application');