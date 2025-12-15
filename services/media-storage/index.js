"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_2 = __importStar(require("react"));
const client_1 = require("react-dom/client");
const genai_1 = require("@google/genai");
// --- Components ---
const AIStudio = () => {
    const [activeSubTab, setActiveSubTab] = (0, react_2.useState)('chat');
    return (<div className="bg-white rounded-lg shadow min-h-[600px] flex flex-col">
      <div className="border-b border-gray-200 px-6 py-4 flex space-x-2 overflow-x-auto">
        {[
            { id: 'chat', label: 'Chat & Intelligence', icon: '💬' },
            { id: 'image', label: 'Image Studio', icon: '🎨' },
            { id: 'vision', label: 'Visual Analysis', icon: '👁️' },
            { id: 'search', label: 'Smart Search', icon: '🗺️' },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveSubTab(tab.id)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeSubTab === tab.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'}`}>
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>))}
      </div>

      <div className="p-6 flex-1">
        {activeSubTab === 'chat' && <ChatModule />}
        {activeSubTab === 'image' && <ImageGenModule />}
        {activeSubTab === 'vision' && <VisionModule />}
        {activeSubTab === 'search' && <SearchModule />}
      </div>
    </div>);
};
const ChatModule = () => {
    const [messages, setMessages] = (0, react_2.useState)([]);
    const [input, setInput] = (0, react_2.useState)('');
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const [mode, setMode] = (0, react_2.useState)('pro');
    const sendMessage = async () => {
        if (!input.trim() || isLoading)
            return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey: process.env.API_KEY });
            let model = 'gemini-3-pro-preview';
            let config = {};
            if (mode === 'fast') {
                model = 'gemini-2.5-flash-lite';
            }
            else if (mode === 'thinking') {
                model = 'gemini-3-pro-preview';
                config.thinkingConfig = { thinkingBudget: 32768 };
            }
            // We use generateContent here to support the specific thinking config easily 
            // without setting up a full chat session object for this simple demo,
            // but in a real app, ai.chats.create is preferred for history.
            // Manually constructing history for the prompt:
            const contents = messages.concat(userMsg).map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));
            const response = await ai.models.generateContent({
                model,
                contents,
                config
            });
            setMessages(prev => [...prev, { role: 'model', text: response.text || "No response text." }]);
        }
        catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="h-full flex flex-col max-w-3xl mx-auto">
      <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg">
        <div className="text-sm font-medium text-gray-700">Model Configuration:</div>
        <select value={mode} onChange={(e) => setMode(e.target.value)} className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="pro">Pro (Gemini 3 Pro) - Complex Tasks</option>
          <option value="fast">Fast (Flash Lite) - Low Latency</option>
          <option value="thinking">Thinking Mode (Gemini 3 Pro) - Deep Reasoning</option>
        </select>
      </div>

      <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto min-h-[400px] max-h-[500px] border border-gray-200">
        {messages.length === 0 && (<div className="text-center text-gray-400 mt-20">
            <p>Select a model and start chatting!</p>
            {mode === 'thinking' && <p className="text-xs mt-2 text-indigo-500">Thinking mode enabled (Budget: 32k tokens)</p>}
          </div>)}
        {messages.map((msg, i) => (<div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>))}
        {isLoading && (<div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-500 italic text-sm">
              Gemini is thinking...
            </div>
          </div>)}
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message..." className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
        <button onClick={sendMessage} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          Send
        </button>
      </div>
    </div>);
};
const ImageGenModule = () => {
    const [prompt, setPrompt] = (0, react_2.useState)('');
    const [aspectRatio, setAspectRatio] = (0, react_2.useState)('1:1');
    const [imageSize, setImageSize] = (0, react_2.useState)('1K');
    const [generatedImage, setGeneratedImage] = (0, react_2.useState)(null);
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const generate = async () => {
        if (!prompt)
            return;
        setIsLoading(true);
        setGeneratedImage(null);
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio,
                        imageSize: imageSize
                    }
                }
            });
            // Find image part
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        }
        catch (e) {
            alert(`Error: ${e.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">gemini-3-pro-image-preview</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
          <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(r => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
            {['1K', '2K', '4K'].map(s => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Describe the image you want..."/>
        </div>

        <button onClick={generate} disabled={isLoading || !prompt} className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      <div className="md:col-span-2 bg-gray-100 rounded-lg flex items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300">
        {generatedImage ? (<img src={generatedImage} alt="Generated" className="max-w-full max-h-[600px] object-contain rounded shadow-lg"/>) : (<div className="text-gray-400 text-center">
            <span className="text-4xl block mb-2">🖼️</span>
            Image preview will appear here
          </div>)}
      </div>
    </div>);
};
const VisionModule = () => {
    const [file, setFile] = (0, react_2.useState)(null);
    const [preview, setPreview] = (0, react_2.useState)(null);
    const [prompt, setPrompt] = (0, react_2.useState)('Analyze this image and list the key elements.');
    const [result, setResult] = (0, react_2.useState)('');
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            const reader = new FileReader();
            reader.onload = (ev) => setPreview(ev.target?.result);
            reader.readAsDataURL(f);
        }
    };
    const analyze = async () => {
        if (!file || !prompt)
            return;
        setIsLoading(true);
        setResult('');
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey: process.env.API_KEY });
            // Convert file to base64 for API
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = reader.result.split(',')[1];
                    resolve(base64String);
                };
                reader.readAsDataURL(file);
            });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: file.type, data: base64Data } },
                        { text: prompt }
                    ]
                }
            });
            setResult(response.text || 'No analysis returned.');
        }
        catch (e) {
            setResult(`Error: ${e.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
             <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
             {preview ? (<img src={preview} alt="Upload" className="max-h-64 mx-auto rounded"/>) : (<div className="text-gray-500">
                 <span className="text-3xl block mb-2">📁</span>
                 Click or drop an image to analyze
               </div>)}
           </div>
           
           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm" rows={3} placeholder="Ask something about the image..."/>

           <button onClick={analyze} disabled={!file || isLoading} className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50">
            {isLoading ? 'Analyzing...' : 'Analyze with Gemini 3 Pro'}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-[300px]">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Analysis Result</h3>
          {result ? (<div className="whitespace-pre-wrap text-gray-800 text-sm">{result}</div>) : (<div className="text-gray-400 text-sm italic">Results will appear here...</div>)}
        </div>
      </div>
    </div>);
};
const SearchModule = () => {
    const [query, setQuery] = (0, react_2.useState)('');
    const [type, setType] = (0, react_2.useState)('web');
    const [result, setResult] = (0, react_2.useState)('');
    const [sources, setSources] = (0, react_2.useState)([]);
    const [isLoading, setIsLoading] = (0, react_2.useState)(false);
    const search = async () => {
        if (!query)
            return;
        setIsLoading(true);
        setResult('');
        setSources([]);
        try {
            const ai = new genai_1.GoogleGenAI({ apiKey: process.env.API_KEY });
            const tool = type === 'web' ? { googleSearch: {} } : { googleMaps: {} };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: query,
                config: {
                    tools: [tool]
                }
            });
            setResult(response.text || 'No results found.');
            // Extract grounding metadata
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const extractedSources = chunks
                .map((c) => {
                if (c.web)
                    return { title: c.web.title, uri: c.web.uri, type: 'web' };
                if (c.maps)
                    return { title: c.maps.title, uri: c.maps.uri, type: 'maps' };
                return null;
            })
                .filter(Boolean);
            setSources(extractedSources);
        }
        catch (e) {
            setResult(`Error: ${e.message}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="max-w-3xl mx-auto space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} placeholder={type === 'web' ? "Search for latest news..." : "Find places nearby..."} className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          <div className="absolute right-2 top-2 flex bg-gray-100 rounded p-0.5">
             <button onClick={() => setType('web')} className={`px-2 py-1 text-xs rounded ${type === 'web' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
               Web
             </button>
             <button onClick={() => setType('maps')} className={`px-2 py-1 text-xs rounded ${type === 'maps' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
               Maps
             </button>
          </div>
        </div>
        <button onClick={search} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? 'Searching...' : 'Go'}
        </button>
      </div>

      {(result || sources.length > 0) && (<div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-6">
             <div className="prose prose-sm max-w-none text-gray-800">
                <div dangerouslySetInnerHTML={{
                // Simple markdown-ish rendering for demo purposes
                __html: result.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            }}/>
             </div>
          </div>
          {sources.length > 0 && (<div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sources & Grounding</h4>
              <ul className="space-y-1">
                {sources.map((s, i) => (<li key={i}>
                    <a href={s.uri} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block flex items-center">
                      <span className="mr-2">{s.type === 'web' ? '🌐' : '📍'}</span>
                      {s.title || s.uri}
                    </a>
                  </li>))}
              </ul>
            </div>)}
        </div>)}
    </div>);
};
// --- App Component ---
const App = () => {
    const [activeTab, setActiveTab] = (0, react_2.useState)('overview');
    const copyToken = () => {
        const token = btoa(JSON.stringify({ tenantId: 'tenant-demo', userId: 'user-demo', role: 'inspector' }));
        navigator.clipboard.writeText(token);
        alert('Mock Bearer Token copied to clipboard!');
    };
    return (<div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">Media Storage Service</h1>
          <p className="mt-2 opacity-80">Backend API Documentation & Developer Portal</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2 overflow-x-auto">
          {['overview', 'api', 'ai-studio', 'architecture', 'client-helper'].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 capitalize font-medium whitespace-nowrap ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.replace('-', ' ')}
            </button>))}
        </div>

        {activeTab === 'overview' && (<div className="space-y-6">
            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Service Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <h3 className="font-semibold text-green-800">API Runtime</h3>
                  <p className="text-sm text-green-600">Ready (Cloud Run)</p>
                </div>
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                  <h3 className="font-semibold text-blue-800">Storage</h3>
                  <p className="text-sm text-blue-600">Google Cloud Storage</p>
                </div>
                <div className="p-4 bg-orange-50 rounded border border-orange-200">
                  <h3 className="font-semibold text-orange-800">Database</h3>
                  <p className="text-sm text-orange-600">Firestore</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Quick Start</h2>
              <p className="mb-4">This is a backend service. To interact with it, you need to use HTTP requests.</p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                <code>
                  # 1. Generate Auth Token<br />
                  const token = btoa(JSON.stringify(&#123; tenantId: 't1', userId: 'u1' &#125;));<br /><br />
                  # 2. Call API<br />
                  curl -X POST /v1/media/initiate-upload \<br />
                  &nbsp;&nbsp;-H "Authorization: Bearer $token" ...
                </code>
              </div>
              <button onClick={copyToken} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                Copy Mock Bearer Token
              </button>
            </section>
          </div>)}

        {activeTab === 'ai-studio' && <AIStudio />}

        {activeTab === 'api' && (<div className="bg-white p-6 rounded-lg shadow space-y-8">
            <div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded uppercase font-bold">POST</span>
              <h3 className="inline-block ml-2 text-lg font-mono">/v1/media/initiate-upload</h3>
              <p className="text-gray-600 mt-2">Get a signed URL to upload a file directly to Cloud Storage.</p>
              <pre className="bg-gray-100 p-3 mt-2 text-sm rounded">
            {`{
  "inspectionId": "insp-123",
  "fileName": "damage.jpg",
  "contentType": "image/jpeg",
  "fileSize": 102400
}`}
              </pre>
            </div>

            <hr />

            <div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded uppercase font-bold">POST</span>
              <h3 className="inline-block ml-2 text-lg font-mono">/v1/media/complete-upload</h3>
              <p className="text-gray-600 mt-2">Notify the backend that upload is finished to trigger processing.</p>
              <pre className="bg-gray-100 p-3 mt-2 text-sm rounded">
            {`{
  "mediaId": "uuid-from-step-1"
}`}
              </pre>
            </div>
            
             <hr />

            <div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded uppercase font-bold">GET</span>
              <h3 className="inline-block ml-2 text-lg font-mono">/v1/inspections/:id/media</h3>
              <p className="text-gray-600 mt-2">List media for an inspection.</p>
            </div>
          </div>)}

        {activeTab === 'architecture' && (<div className="bg-white p-6 rounded-lg shadow">
             <h2 className="text-xl font-bold mb-4">System Architecture</h2>
             <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Runtime:</strong> Google Cloud Run (Node.js)</li>
                <li><strong>Storage:</strong> Google Cloud Storage (Originals & Thumbnails)</li>
                <li><strong>Database:</strong> Firestore (Metadata)</li>
                <li><strong>Async Processing:</strong> Cloud Pub/Sub + Cloud Run (Worker endpoint)</li>
             </ul>
          </div>)}

        {activeTab === 'client-helper' && (<div className="bg-white p-6 rounded-lg shadow">
             <h2 className="text-xl font-bold mb-4">Client Integration Code</h2>
             <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
            {`class MediaClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async uploadPhoto(file, inspectionId) {
    // 1. Initiate
    const initRes = await fetch(\`\${this.baseUrl}/v1/media/initiate-upload\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${this.token}\`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        inspectionId,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type
      })
    });
    const { mediaId, signedUploadUrl } = await initRes.json();

    // 2. Upload to GCS
    await fetch(signedUploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file
    });

    // 3. Complete
    await fetch(\`\${this.baseUrl}/v1/media/complete-upload\`, {
      method: 'POST',
      headers: { 
        'Authorization': \`Bearer \${this.token}\`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ mediaId })
    });

    return mediaId;
  }
}`}
             </pre>
           </div>)}
      </main>
    </div>);
};
const container = document.getElementById('root');
const root = (0, client_1.createRoot)(container);
root.render(<App />);
