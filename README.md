# Property Inspection Platform

## Project Overview
- **Name**: Property Inspection Platform
- **Goal**: Professional property condition reporting system powered by Gemini AI for automated photo analysis and report generation
- **Features**: AI-powered property inspections, automated report generation, cloud storage

## URLs
- **Development**: https://3000-ij3c3oj6h9i36yb7qfcah-b32ec7bb.sandbox.novita.ai
- **Production**: Will be deployed to Cloudflare Pages (pending)
- **Health Check**: https://3000-ij3c3oj6h9i36yb7qfcah-b32ec7bb.sandbox.novita.ai/api/health

## Data Architecture
- **Data Models**: 
  - ReportData: Property inspection reports with rooms, items, and photos
  - Room: Individual room data with inspection items
  - InspectionItem: Individual items to inspect with condition flags
  - Photo: Image data with tags and analysis
- **Storage Services**: 
  - Cloudflare KV: For storing inspection reports
  - Gemini API: For AI-powered image analysis
- **Data Flow**: 
  1. User uploads property photos
  2. Gemini AI analyzes photos for condition assessment
  3. System generates structured inspection report
  4. Report saved to Cloudflare KV storage
  5. PDF export available for final reports

## Features Completed
✅ Hono backend API server with Cloudflare Pages compatibility
✅ Gemini AI integration for image analysis
✅ API endpoints for report management (CRUD operations)
✅ Cloudflare KV storage integration
✅ Health check endpoint
✅ CORS enabled for frontend integration
✅ Development server running with PM2

## Features In Progress
⏳ Full React frontend application integration
⏳ Photo upload and management interface
⏳ Room-by-room inspection workflow
⏳ PDF report generation
⏳ User authentication

## API Endpoints
- `GET /api/health` - Health check and status
- `POST /api/gemini/analyze` - AI-powered image analysis
  - Body: `{ prompt: string, images: [{data: base64, mimeType: string}], model?: string }`
- `GET /api/reports` - List all saved reports
- `POST /api/reports/save` - Save inspection report
  - Body: Full ReportData object
- `GET /api/reports/:id` - Get specific report by ID
- `DELETE /api/reports/:id` - Delete report by ID

## User Guide
1. **Access the platform**: Navigate to the development URL
2. **Create inspection**: Upload property photos for each room
3. **AI Analysis**: System automatically analyzes photos for defects and conditions
4. **Review & Edit**: Review AI-generated comments and make adjustments
5. **Save Report**: Save inspection report to cloud storage
6. **Export PDF**: Generate professional PDF report for clients

## Deployment
- **Platform**: Cloudflare Pages with Workers
- **Status**: ✅ Development Active / ❌ Production Pending
- **Tech Stack**: 
  - Backend: Hono + TypeScript + Cloudflare Workers
  - Frontend: React + TypeScript + TailwindCSS
  - AI: Google Gemini API
  - Storage: Cloudflare KV
- **Last Updated**: December 11, 2024

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account
- Google Gemini API key

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.dev.vars` file with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Build the project: `npm run build`
5. Start development server: `npm run dev:sandbox`
6. Access at http://localhost:3000

### Production Deployment
1. Configure Cloudflare API key
2. Create KV namespace: `npx wrangler kv:namespace create inspection_kv_production`
3. Update `wrangler.jsonc` with KV namespace ID
4. Set Gemini API key as secret: `npx wrangler pages secret put GEMINI_API_KEY`
5. Deploy: `npm run deploy:prod`

## Next Steps
1. **Complete React Frontend**: Integrate the full React application with the API
2. **Add Authentication**: Implement user authentication for secure access
3. **Enhanced PDF Generation**: Improve PDF report formatting and customization
4. **Batch Photo Processing**: Enable bulk photo upload and processing
5. **Report Templates**: Add customizable report templates for different property types
6. **Mobile Optimization**: Ensure responsive design for field inspections on mobile devices

## Architecture Notes
- The application is designed for edge deployment on Cloudflare's global network
- All data storage uses Cloudflare KV for serverless operation
- Gemini AI processes images server-side to protect API keys
- Static assets are served directly from Cloudflare's CDN for optimal performance

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI analysis
- `ENVIRONMENT`: Development/Production flag
- KV namespace bindings configured in `wrangler.jsonc`

## Support
For issues or questions, please check the API health endpoint first to ensure services are running.