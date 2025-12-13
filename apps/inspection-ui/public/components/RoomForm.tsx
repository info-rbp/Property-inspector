import React, { useRef, useState, useEffect } from 'react';
import { Room, InspectionItem, Photo } from '../types';
import { Trash2, Plus, Sparkles, Loader2, Image as ImageIcon, Check, X, ImageOff, FileWarning, Bot, Wand2 } from 'lucide-react';
import { generateId, processImageFile } from '../utils';
import { generateItemComment, generateOverallComment } from '../services/geminiService';

interface RoomFormProps {
  room: Room;
  onUpdate: (updatedRoom: Room) => void;
  onDelete: () => void;
}

interface QueueItem {
  id: string;
  file: File;
  status: 'pending' | 'processing';
}

// Sub-component to handle individual photo states (Loading, Error, Success, HEIC)
const PhotoThumbnail: React.FC<{ photo: Photo, isPending?: boolean }> = ({ photo, isPending }) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'heic_fallback'>('loading');

  const name = photo.file.name.toLowerCase();
  // Check if it is a HEIC file that hasn't been converted (i.e. conversion failed in utils.ts)
  const isHeic = name.endsWith('.heic') || 
                 name.endsWith('.heif') ||
                 photo.file.type === 'image/heic' ||
                 photo.file.type === 'image/heif';

  useEffect(() => {
    const img = new Image();
    img.src = photo.previewUrl;

    if (isHeic) {
      // For HEIC, try to load it natively (Safari support) first
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('heic_fallback'); // Fallback to placeholder if native render fails
    } else {
      // Standard images
      img.onload = () => setStatus('loaded');
      img.onerror = () => setStatus('error');
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [photo.previewUrl, isHeic]);

  // Explicit HEIC placeholder (known conversion failure or raw file on non-supported browser)
  if (status === 'heic_fallback') {
    return (
      <div className={`w-full h-full bg-amber-50 flex flex-col items-center justify-center text-amber-700 p-1 border border-amber-200 rounded select-none animate-pulse ${isPending ? 'opacity-90' : ''}`} title="HEIC format - Preview unavailable but file is attached for AI analysis">
        <FileWarning size={20} className="mb-1 opacity-75" />
        <span className="text-[9px] font-bold text-center leading-tight">HEIC<br/>(No Preview)</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative bg-gray-50 rounded border ${isPending ? 'border-transparent' : 'border-gray-200'} overflow-hidden group-hover:border-blue-300 transition-colors`}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-gray-100 text-blue-400">
          <Loader2 size={20} className="animate-spin mb-1" />
        </div>
      )}
      
      {status === 'error' ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-red-400 p-1 bg-red-50" title="Image failed to load">
           <ImageOff size={20} className="mb-1 opacity-75" />
           <span className="text-[9px] font-bold text-center leading-tight">Load<br/>Error</span>
        </div>
      ) : (
        <img 
          src={photo.previewUrl} 
          className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          alt="Thumbnail" 
          loading="lazy"
        />
      )}
    </div>
  );
};

const RoomForm: React.FC<RoomFormProps> = ({ room, onUpdate, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [generatingOverall, setGeneratingOverall] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<Photo[]>([]);
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);

  // Derived processing state for blocking UI actions
  const isProcessing = processingQueue.length > 0;
  const isBlockingUI = isFinalizing || isProcessing || isAutoGenerating;

  // Queue Processor Effect
  useEffect(() => {
    const processNextItem = async () => {
      // If queue is empty or already processing an item, do nothing
      if (processingQueue.length === 0 || processingRef.current) return;

      const item = processingQueue[0];
      processingRef.current = true;

      try {
        // 1. Update status to processing (trigger UI update)
        if (item.status === 'pending') {
           setProcessingQueue(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing' } : i));
        }

        // 2. Short delay to allow React to render the loading spinner
        await new Promise(resolve => setTimeout(resolve, 50));

        // 3. Process the file
        let processedFile: File;
        try {
           processedFile = await processImageFile(item.file);
        } catch (err) {
           console.error(`Processing failed for ${item.file.name}`, err);
           // Fallback to original file on error so we don't lose the user's upload
           processedFile = item.file;
        }

        const newPhoto: Photo = {
            id: generateId(),
            file: processedFile,
            previewUrl: URL.createObjectURL(processedFile)
        };
        
        // 4. Move from queue to pending photos
        setPendingPhotos(prev => [...prev, newPhoto]);
        setProcessingQueue(prev => prev.filter(i => i.id !== item.id));

      } catch (error) {
        console.error("Queue Manager Error:", error);
        // Remove problematic item to prevent queue blockage
        setProcessingQueue(prev => prev.filter(i => i.id !== item.id));
      } finally {
        // 5. Unlock for next item
        processingRef.current = false;
      }
    };

    processNextItem();
  }, [processingQueue]);

  // --- BULK AI ANALYSIS LOGIC ---
  const runBulkAnalysis = async (photosContext: Photo[]) => {
      if (photosContext.length === 0) return;

      setIsAutoGenerating(true);
      
      // Create a local accumulation of the room state to prevent stale updates 
      // during the batched async process.
      let localRoomState = { ...room, photos: photosContext };
      
      // 1. Generate Overall Comment
      try {
          setGeneratingOverall(true);
          const overall = await generateOverallComment(localRoomState.name, photosContext);
          localRoomState.overallComment = overall;
          onUpdate(localRoomState);
      } catch (e) {
          console.error("Overall generation failed", e);
      } finally {
          setGeneratingOverall(false);
      }

      // 2. Generate Item Comments (Batched to prevent rate limits)
      const currentItems = [...localRoomState.items];
      const BATCH_SIZE = 3;

      for (let i = 0; i < currentItems.length; i += BATCH_SIZE) {
          const batch = currentItems.slice(i, i + BATCH_SIZE);
          
          await Promise.all(batch.map(async (item) => {
              setLoadingItems(prev => new Set(prev).add(item.id));
              try {
                  const comment = await generateItemComment(item.name, localRoomState.name, photosContext);
                  const idx = currentItems.findIndex(x => x.id === item.id);
                  if (idx !== -1) {
                      currentItems[idx] = { ...currentItems[idx], comment };
                  }
              } catch (err) {
                  console.error(`Failed to generate comment for ${item.name}`, err);
              } finally {
                  setLoadingItems(prev => {
                    const next = new Set(prev);
                    next.delete(item.id);
                    return next;
                  });
              }
          }));

          // Push batch results to parent
          localRoomState.items = [...currentItems];
          onUpdate(localRoomState);
      }

      setIsAutoGenerating(false);
  };

  const handleAddItem = () => {
    const newItem: InspectionItem = {
      id: generateId(),
      name: 'New Item',
      isClean: true,
      isUndamaged: true,
      isWorking: true,
      comment: ''
    };
    onUpdate({ ...room, items: [...room.items, newItem] });
  };

  const updateItem = (itemId: string, updates: Partial<InspectionItem>) => {
    const newItems = room.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ ...room, items: newItems });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({ ...room, items: room.items.filter(i => i.id !== itemId) });
  };

  // STAGE 1: Add files to queue
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const rawFiles = Array.from(e.target.files) as File[];

      // Initialize queue items as 'pending'
      const newQueueItems: QueueItem[] = rawFiles.map(f => ({
        id: generateId(),
        file: f,
        status: 'pending'
      }));
      
      setProcessingQueue(prev => [...prev, ...newQueueItems]);
      
      // Clear input to allow re-selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // STAGE 2: Finalize Upload
  const finalizeUpload = async () => {
    setIsFinalizing(true);
    // Add artificial delay for better UX (so user sees the spinner/confirmation)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const allPhotos = [...room.photos, ...pendingPhotos];
    onUpdate({ ...room, photos: allPhotos });
    setPendingPhotos([]);
    setIsFinalizing(false);

    // Trigger Bulk Analysis on the newly finalized photos
    await runBulkAnalysis(allPhotos);
  };

  const cancelUpload = () => {
    // Revoke object URLs to prevent memory leaks for discarded photos
    pendingPhotos.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
    setProcessingQueue([]); // Also clear queue if discarding
  };

  const removePendingPhoto = (photoId: string) => {
    const photoToRemove = pendingPhotos.find(p => p.id === photoId);
    if (photoToRemove) URL.revokeObjectURL(photoToRemove.previewUrl);
    setPendingPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const removePhoto = (photoId: string) => {
    onUpdate({ ...room, photos: room.photos.filter(p => p.id !== photoId) });
  };

  const generateAIComment = async (item: InspectionItem) => {
    if (room.photos.length === 0) {
      alert("Please upload and finalize photos for this room first.");
      return;
    }

    setLoadingItems(prev => new Set(prev).add(item.id));
    try {
      const comment = await generateItemComment(item.name, room.name, room.photos);
      updateItem(item.id, { comment });
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI comment. Check console or API Key.");
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleGenerateOverall = async () => {
    if (room.photos.length === 0) {
      alert("Please upload and finalize photos for this room first.");
      return;
    }
    setGeneratingOverall(true);
    try {
      const comment = await generateOverallComment(room.name, room.photos);
      onUpdate({ ...room, overallComment: comment });
    } catch (err) {
      console.error(err);
      alert("Failed to generate overall comment. Check console or API Key.");
    } finally {
      setGeneratingOverall(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden relative ${isAutoGenerating ? 'ring-2 ring-purple-400' : ''}`}>
      
      {/* Auto-Generation Overlay */}
      {isAutoGenerating && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-purple-50 border-b border-purple-200 p-2 flex items-center justify-center gap-2 shadow-sm animate-pulse">
              <Bot className="text-purple-600" size={18} />
              <span className="text-xs font-bold text-purple-700">AI Analysis in Progress: Generating condition reports from photos...</span>
              <Loader2 className="animate-spin text-purple-600" size={16} />
          </div>
      )}

      {/* Header */}
      <div className={`bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center ${isAutoGenerating ? 'pt-10' : ''}`}>
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {room.items.length} items
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {room.photos.length} photos
            </span>
        </div>
        <button onClick={onDelete} disabled={isBlockingUI} className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition disabled:opacity-50">
          <Trash2 size={18} />
        </button>
      </div>

      <div className={`p-4 ${isAutoGenerating ? 'opacity-80 pointer-events-none' : ''}`}>
        {/* Photos Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
             <h4 className="text-sm font-medium text-gray-600 flex items-center gap-2">
               <ImageIcon size={16}/> Saved Photos
             </h4>
             <button 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                disabled={isBlockingUI}
                className={`text-sm flex items-center gap-1 hover:underline ${isBlockingUI ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
             >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Select Photos
                  </>
                )}
             </button>
             <input 
               type="file" 
               multiple 
               accept="image/*,.heic,.heif" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleFileSelect}
             />
          </div>
          
          {/* STAGE 1: Pending Photos & Processing Queue */}
          {(pendingPhotos.length > 0 || processingQueue.length > 0) && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-xs font-bold text-amber-800 flex items-center gap-1">
                  <Sparkles size={12} /> 
                  {pendingPhotos.length} Photo(s) Ready {processingQueue.length > 0 && `(${processingQueue.length} processing...)`}
                </h5>
                <div className="flex gap-2">
                   <button 
                     onClick={cancelUpload}
                     disabled={isBlockingUI}
                     className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <X size={12} /> Discard
                   </button>
                   <button 
                     onClick={finalizeUpload}
                     disabled={isBlockingUI}
                     className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1 rounded shadow-sm flex items-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed min-w-[100px] justify-center"
                   >
                     {isFinalizing ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                     {isFinalizing ? 'Saving...' : 'Finalize Upload'}
                   </button>
                </div>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Render Processed Photos */}
                {pendingPhotos.map(photo => (
                  <div key={photo.id} className="relative flex-shrink-0 w-20 h-20 group border-2 border-amber-400 rounded overflow-hidden bg-white shadow-sm">
                    <div className="absolute top-0 left-0 bg-amber-500 text-white text-[9px] font-bold px-1 z-20 rounded-br shadow-sm">PENDING</div>
                    <PhotoThumbnail photo={photo} isPending={true} />
                    <button 
                      onClick={() => removePendingPhoto(photo.id)}
                      disabled={isBlockingUI}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl shadow-sm z-30 hover:bg-red-600 transition"
                      title="Remove from pending"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                
                {/* Render Processing Queue */}
                {processingQueue.map(item => (
                  <div key={item.id} className="relative flex-shrink-0 w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-1 shadow-sm opacity-75">
                    <span className="text-[8px] text-gray-600 truncate w-full text-center mb-1 font-medium" title={item.file.name}>{item.file.name}</span>
                    {item.status === 'processing' ? (
                        <>
                           <Loader2 size={16} className="animate-spin text-blue-500 mb-1" />
                           <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                               <div className="h-full bg-blue-500 animate-pulse w-full"></div>
                           </div>
                           <span className="text-[8px] text-blue-600 mt-0.5">Converting</span>
                        </>
                    ) : (
                        <span className="text-[9px] text-gray-400">Waiting...</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-amber-700 mt-1 italic">
                * Photos above are staged. Click 'Finalize Upload' to attach them to the report.
              </p>
            </div>
          )}

          {/* STAGE 2: Finalized/Saved Photos */}
          {room.photos.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto pb-2 min-h-[100px]">
                {room.photos.map(photo => (
                  <div key={photo.id} className="relative flex-shrink-0 w-24 h-24 group border border-gray-200 rounded bg-gray-50">
                    <PhotoThumbnail photo={photo} />
                    <button 
                      onClick={() => removePhoto(photo.id)}
                      disabled={isBlockingUI}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition shadow-sm z-20"
                      title="Remove photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              {/* NEW: Bulk Auto-Generate Option */}
              <div className="border-t border-gray-100 pt-2 flex justify-end">
                  <button
                      onClick={() => {
                          if(confirm("This will analyze all current photos and re-generate comments for the Room Overview and all Items. Existing comments will be updated. Continue?")) {
                              runBulkAnalysis(room.photos);
                          }
                      }}
                      disabled={isBlockingUI}
                      className="flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded transition disabled:opacity-50"
                      title="Re-run AI analysis on all existing photos"
                  >
                      <Wand2 size={14} /> 
                      Bulk Auto-Generate All Comments
                  </button>
              </div>
            </div>
          ) : (
             pendingPhotos.length === 0 && processingQueue.length === 0 && (
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 rounded p-6 text-center transition ${isProcessing ? 'cursor-wait bg-gray-50' : 'cursor-pointer hover:border-blue-400 hover:text-blue-500 text-gray-400'}`}
                >
                    {isProcessing ? (
                       <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Loader2 size={24} className="animate-spin text-blue-500" />
                          <p className="text-sm">Initializing upload...</p>
                       </div>
                    ) : (
                       <p className="text-sm">Click to select photos (supports HEIC & Standard)</p>
                    )}
                </div>
             )
          )}
        </div>

        {/* Room Overview */}
        <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-200">
             <div className="flex justify-between items-center mb-2">
                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Room General Overview</label>
             </div>
             <div className="relative">
                 <textarea
                    value={room.overallComment}
                    onChange={(e) => onUpdate({ ...room, overallComment: e.target.value })}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 min-h-[60px]"
                    placeholder="General comments about the room's condition (e.g. Clean and well maintained)..."
                    disabled={isBlockingUI}
                 />
                 <button
                    onClick={handleGenerateOverall}
                    disabled={generatingOverall || isBlockingUI}
                    className="absolute top-2 right-2 text-purple-600 bg-purple-50 hover:bg-purple-100 p-1 rounded-full transition tooltip z-10 border border-purple-200"
                    title="Auto-generate overview from photos"
                 >
                    {generatingOverall ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                 </button>
             </div>
        </div>

        {/* Items Table Header */}
        <div className="grid grid-cols-12 gap-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
          <div className="col-span-3">Item</div>
          <div className="col-span-2 flex justify-between px-2">
            <span>Cln</span>
            <span>Udg</span>
            <span>Wkg</span>
          </div>
          <div className="col-span-6">Comments</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {room.items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-2 rounded hover:bg-gray-100 transition group">
              {/* Name Input */}
              <div className="col-span-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  className="w-full bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none text-sm font-medium"
                  placeholder="Item Name"
                  disabled={isBlockingUI}
                />
              </div>

              {/* Toggles */}
              <div className="col-span-2 flex justify-between px-2 pt-1">
                <input 
                    type="checkbox" 
                    checked={item.isClean} 
                    onChange={(e) => updateItem(item.id, { isClean: e.target.checked })}
                    className="accent-green-600 w-4 h-4 cursor-pointer" 
                    title="Clean"
                    disabled={isBlockingUI}
                />
                <input 
                    type="checkbox" 
                    checked={item.isUndamaged} 
                    onChange={(e) => updateItem(item.id, { isUndamaged: e.target.checked })}
                    className="accent-green-600 w-4 h-4 cursor-pointer" 
                    title="Undamaged"
                    disabled={isBlockingUI}
                />
                <input 
                    type="checkbox" 
                    checked={item.isWorking} 
                    onChange={(e) => updateItem(item.id, { isWorking: e.target.checked })}
                    className="accent-green-600 w-4 h-4 cursor-pointer" 
                    title="Working"
                    disabled={isBlockingUI}
                />
              </div>

              {/* Comment & AI */}
              <div className="col-span-6 relative">
                 <textarea
                    value={item.comment}
                    onChange={(e) => updateItem(item.id, { comment: e.target.value })}
                    className="w-full text-sm p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 min-h-[60px]"
                    placeholder="Describe condition..."
                    disabled={isBlockingUI}
                 />
                 <button
                    onClick={() => generateAIComment(item)}
                    disabled={loadingItems.has(item.id) || isBlockingUI}
                    className="absolute top-2 right-2 text-purple-600 bg-purple-50 hover:bg-purple-100 p-1 rounded-full transition tooltip z-10"
                    title="Auto-generate comment from photos"
                 >
                    {loadingItems.has(item.id) ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Sparkles size={14} />
                    )}
                 </button>
              </div>

              {/* Delete */}
              <div className="col-span-1 flex justify-end">
                <button 
                  onClick={() => deleteItem(item.id)}
                  disabled={isBlockingUI}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition pt-2 disabled:opacity-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button 
            onClick={handleAddItem}
            disabled={isBlockingUI}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
            <Plus size={16} /> Add Item
        </button>
      </div>
    </div>
  );
};

export default RoomForm;