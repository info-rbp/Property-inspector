const fs = require('fs');

// Read the HTML file
const htmlContent = fs.readFileSync('./public/full-app.html', 'utf-8');

// Escape the HTML for embedding in JavaScript
const escapedHtml = htmlContent
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$/g, '\\$');

// Create the new Hono server code with embedded HTML
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

// Serve the main application
app.get('/', (c) => {
  return c.html(APP_HTML);
});

// API endpoint for Gemini AI image analysis
app.post('/api/gemini/analyze', async (c) => {
  const { env } = c
  
  try {
    const body = await c.req.json()
    const { prompt, images, model = 'gemini-2.0-flash-exp' } = body

    if (!env.GEMINI_API_KEY) {
      return c.json({ error: 'Gemini API key not configured' }, 401)
    }

    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const genModel = genAI.getGenerativeModel({ model })

    // Process images - convert base64 to proper format
    const imageParts = images.map((img: any) => ({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: img.data
      }
    }))

    // Generate content
    const result = await genModel.generateContent({
      contents: [{
        role: 'user',
        parts: [...imageParts, { text: prompt }]
      }]
    })

    const response = await result.response
    const text = response.text()

    return c.json({ text })
  } catch (error: any) {
    console.error('Gemini API error:', error)
    return c.json({ 
      error: error.message || 'Failed to analyze with Gemini',
      details: error.toString()
    }, 500)
  }
})

// API endpoint for saving reports
app.post('/api/reports/save', async (c) => {
  const { env } = c
  
  try {
    const report = await c.req.json()
    const key = \`report:\${report.id}\`
    
    await env.KV.put(key, JSON.stringify(report), {
      metadata: {
        propertyAddress: report.propertyAddress,
        inspectionDate: report.inspectionDate,
        createdAt: new Date().toISOString()
      }
    })

    return c.json({ success: true, id: report.id })
  } catch (error: any) {
    console.error('Save report error:', error)
    return c.json({ error: 'Failed to save report' }, 500)
  }
})

// API endpoint for listing reports
app.get('/api/reports', async (c) => {
  const { env } = c
  
  try {
    const list = await env.KV.list({ prefix: 'report:' })
    const reports = []

    for (const key of list.keys) {
      if (key.metadata) {
        reports.push({
          id: key.name.replace('report:', ''),
          ...key.metadata
        })
      }
    }

    // Sort by inspection date descending
    reports.sort((a: any, b: any) => 
      new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
    )

    return c.json(reports)
  } catch (error: any) {
    console.error('List reports error:', error)
    return c.json({ error: 'Failed to list reports' }, 500)
  }
})

// API endpoint for loading a specific report
app.get('/api/reports/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    const key = \`report:\${id}\`
    const report = await env.KV.get(key, 'json')
    
    if (!report) {
      return c.json({ error: 'Report not found' }, 404)
    }

    return c.json(report)
  } catch (error: any) {
    console.error('Load report error:', error)
    return c.json({ error: 'Failed to load report' }, 500)
  }
})

// API endpoint for deleting a report
app.delete('/api/reports/:id', async (c) => {
  const { env } = c
  const id = c.req.param('id')
  
  try {
    const key = \`report:\${id}\`
    await env.KV.delete(key)
    
    return c.json({ success: true })
  } catch (error: any) {
    console.error('Delete report error:', error)
    return c.json({ error: 'Failed to delete report' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok',
    service: 'inspection-platform',
    timestamp: new Date().toISOString()
  })
})

export default app`;

// Write the new server file
fs.writeFileSync('./src/index.tsx', serverCode);

console.log('Successfully embedded HTML into Hono server!');