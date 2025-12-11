import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Bindings = {
  GEMINI_API_KEY: string
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// Serve the main HTML page with the full React app
app.get('/', async (c) => {
  // In production, this would be served from the dist folder
  // For development, we'll serve the HTML directly
  const htmlContent = await fetch('file:///home/user/webapp/public/index.html')
    .then(res => res.text())
    .catch(() => null);
    
  if (htmlContent) {
    return c.html(htmlContent);
  }
  
  // Fallback HTML if file not found
  return c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Property Inspection Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root">
      <div class="min-h-screen bg-gray-100 p-4">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-3xl font-bold text-gray-800 mb-4">Property Inspection Platform</h1>
          <p class="text-gray-600 mb-8">Professional property condition reporting system powered by Gemini AI</p>
          
          <div class="bg-white rounded-lg shadow p-6 mb-4">
            <h2 class="text-xl font-semibold mb-4">System Status</h2>
            <div class="space-y-2">
              <div class="flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>API Server: Online</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Gemini AI: Ready</span>
              </div>
              <div class="flex items-center">
                <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span>Storage: Connected</span>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6 mb-4">
            <h2 class="text-xl font-semibold mb-4">Features</h2>
            <ul class="list-disc list-inside space-y-2 text-gray-600">
              <li>AI-powered property photo analysis</li>
              <li>Automated condition report generation</li>
              <li>Room-by-room inspection tracking</li>
              <li>PDF report export</li>
              <li>Cloud-based report storage</li>
            </ul>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">API Endpoints</h2>
            <div class="space-y-2">
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                GET /api/health - Health check
              </div>
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                POST /api/gemini/analyze - AI image analysis
              </div>
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                GET /api/reports - List all reports
              </div>
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                POST /api/reports/save - Save a report
              </div>
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                GET /api/reports/:id - Get specific report
              </div>
              <div class="font-mono text-sm bg-gray-100 p-2 rounded">
                DELETE /api/reports/:id - Delete a report
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`)
})

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
    const key = `report:${report.id}`
    
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
    const key = `report:${id}`
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
    const key = `report:${id}`
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

export default app