/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Crop, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Image as ImageIcon, 
  RefreshCw, 
  Settings,
  Info
} from 'lucide-react';

interface ImageUploaderWithCropProps {
  isDarkMode: boolean;
  value: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  defaultAspectRatio?: number; // width / height
}

export default function ImageUploaderWithCrop({
  isDarkMode,
  value,
  onChange,
  label = "পণ্যের ছবি আপলোড করুন",
  defaultAspectRatio = 1 // default to 1:1 Square
}: ImageUploaderWithCropProps) {
  const [aspectRatio, setAspectRatio] = useState<number>(defaultAspectRatio);
  const [dragActive, setDragActive] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [needsCropping, setNeedsCropping] = useState(false);
  const [cropOption, setCropOption] = useState<'auto' | 'manual'>('auto');
  
  // Crop adjustments
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Aspect ratio options available for selection
  const aspectRatios = [
    { value: 1, label: '১:১ স্কয়ার (Square - শুটকী/আচার/ক্যাটালগ)', sub: 'Standard 1:1' },
    { value: 1.333, label: '৪:৩ স্ট্যান্ডার্ড (তাজা ঝুড়ি মাছ/স্মার্ট ভিউ)', sub: 'Classic 4:3' },
    { value: 1.777, label: '১৬:৯ ল্যান্ডস্কেপ (হিরো ব্যানার/স্লাইডার)', sub: 'Landscape 16:9' },
  ];

  // If a preset Unsplash/external URL changes value from parenting form, match it.
  useEffect(() => {
    if (value && !value.startsWith('data:')) {
      // It's an external URL (e.g. Unsplash selected)
      setImageSrc(null);
      setImageObj(null);
      setNeedsCropping(false);
    }
  }, [value]);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle Drop Events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Process the uploaded file
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল আপলোড করুন (JPEG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      
      // Load image to check aspect ratio
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setImageSrc(dataUrl);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const targetRatio = aspectRatio;
        
        // Tolerance margin (about 2%)
        const difference = Math.abs(imgRatio - targetRatio);
        
        if (difference <= 0.03) {
          // Correct Aspect Ratio! No cropping needed!
          setNeedsCropping(false);
          onChange(dataUrl);
        } else {
          // Incorrect Ratio! Needs adjustment
          setNeedsCropping(true);
          setCropOption('auto'); // Default to auto-center-crop preview
          
          // Trigger immediate draw/preview
          drawCanvas(img, dataUrl, aspectRatio, 1, 0, 0, 'auto');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Main Canvas drawing routine
  const drawCanvas = (
    img: HTMLImageElement,
    src: string,
    targetRatio: number,
    currentZoom: number,
    currOffsetX: number,
    currOffsetY: number,
    mode: 'auto' | 'manual'
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define export size based on natural scale but locked to standard box
    // (e.g. 500 max dimension for performance & space storage)
    const exportWidth = 500;
    const exportHeight = exportWidth / targetRatio;
    
    canvas.width = exportWidth;
    canvas.height = exportHeight;

    ctx.clearRect(0, 0, exportWidth, exportHeight);

    if (mode === 'auto') {
      // Automatic center cropping logic
      const imgRatio = img.naturalWidth / img.naturalHeight;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.naturalWidth;
      let sourceHeight = img.naturalHeight;

      if (imgRatio > targetRatio) {
        // Image is wider than target ratio
        sourceWidth = img.naturalHeight * targetRatio;
        sourceX = (img.naturalWidth - sourceWidth) / 2;
      } else {
        // Image is taller than target ratio
        sourceHeight = img.naturalWidth / targetRatio;
        sourceY = (img.naturalHeight - sourceHeight) / 2;
      }

      ctx.drawImage(
        img, 
        sourceX, sourceY, sourceWidth, sourceHeight, // source coordinate box
        0, 0, exportWidth, exportHeight // canvas coordinate target box
      );

    } else {
      // Manual interactive pan and zoom canvas scaling
      ctx.fillStyle = '#0f172a'; // nice dark backdrop for empty space
      ctx.fillRect(0, 0, exportWidth, exportHeight);

      // Save context state for custom transformation
      ctx.save();
      
      // Translate to canvas center
      ctx.translate(exportWidth / 2 + currOffsetX, exportHeight / 2 + currOffsetY);
      
      // Calculate fit scale (base sizing)
      const baseScale = Math.max(exportWidth / img.naturalWidth, exportHeight / img.naturalHeight);
      const finalScale = baseScale * currentZoom;

      ctx.scale(finalScale, finalScale);
      
      // Draw image centered inside transformed state
      ctx.drawImage(
        img, 
        -img.naturalWidth / 2, 
        -img.naturalHeight / 2
      );
      
      ctx.restore();

      // Draw subtle grid overlay inside manual editor for precision
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 1;
      
      // Draw rule of thirds
      ctx.beginPath();
      // Verticals
      ctx.moveTo(exportWidth / 3, 0); ctx.lineTo(exportWidth / 3, exportHeight);
      ctx.moveTo((exportWidth * 2) / 3, 0); ctx.lineTo((exportWidth * 2) / 3, exportHeight);
      // Horizontals
      ctx.moveTo(0, exportHeight / 3); ctx.lineTo(exportWidth, exportHeight / 3);
      ctx.moveTo(0, (exportHeight * 2) / 3); ctx.lineTo(exportWidth, (exportHeight * 2) / 3);
      ctx.stroke();
    }
  };

  // Re-draw whenever adjustments are updated
  useEffect(() => {
    if (imageObj && imageSrc) {
      drawCanvas(imageObj, imageSrc, aspectRatio, zoom, offsetX, offsetY, cropOption);
    }
  }, [imageObj, aspectRatio, zoom, offsetX, offsetY, cropOption]);

  // Handle Drag interaction on canvas (for panning/manual positioning)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (cropOption !== 'manual') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || cropOption !== 'manual') return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleCanvasMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch Support for mobile cropping
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (cropOption !== 'manual' || e.touches.length === 0) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || cropOption !== 'manual' || e.touches.length === 0) return;
    const touch = e.touches[0];
    setOffsetX(touch.clientX - dragStart.x);
    setOffsetY(touch.clientY - dragStart.y);
  };

  // Commit crop
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onChange(croppedDataUrl);
    setNeedsCropping(false);
  };

  // Cancel custom upload or reset
  const handleRemoveImage = () => {
    setImageSrc(null);
    setImageObj(null);
    setNeedsCropping(false);
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Aspect Ratio Selector */}
      <div className="space-y-1.5 p-3.5 rounded-2xl border bg-orange-500/5 border-orange-500/10 dark:bg-orange-500/10">
        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-sans font-bold">
          <Settings size={14} />
          <span className="bangla-text text-xs">ছবির রেশিও (Aspect Ratio) নির্বাচন করুন</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {aspectRatios.map((ratio) => (
            <button
              type="button"
              key={ratio.value}
              onClick={() => {
                setAspectRatio(ratio.value);
                // If there's an image already uploaded, check ratio again
                if (imageObj) {
                  const imgRatio = imageObj.naturalWidth / imageObj.naturalHeight;
                  const difference = Math.abs(imgRatio - ratio.value);
                  if (difference <= 0.03) {
                    setNeedsCropping(false);
                    if (imageSrc) onChange(imageSrc);
                  } else {
                    setNeedsCropping(true);
                  }
                }
              }}
              className={`p-2.5 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-center ${
                Math.abs(aspectRatio - ratio.value) < 0.01
                  ? 'border-orange-500 bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-bold bangla-text">{ratio.label}</span>
              <span className="text-[10px] font-mono text-slate-400 mt-0.5">{ratio.sub}</span>
              {Math.abs(aspectRatio - ratio.value) < 0.01 && (
                <div className="absolute right-2 top-2 w-3.5 h-3.5 bg-orange-500 text-white rounded-full flex items-center justify-center text-[8px]">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Upload Area */}
      {!imageSrc ? (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 min-h-[160px] ${
            dragActive 
              ? 'border-orange-500 bg-orange-500/5 dark:bg-orange-500/10' 
              : 'border-slate-200 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />

          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Upload size={22} className="animate-bounce" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 bangla-text">
              ছবি ড্র্যাগ করুন অথবা ক্লিক করে সিলেক্ট করুন
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              JPEG, PNG, বা WebP (সর্বোচ্চ ১০ মেগাবাইট)
            </p>
          </div>

          <div className="text-[10px] bg-slate-200/50 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Info size={11} />
            <span className="bangla-text">রেশিও মেলানো ছবি হলে সরাসরি আপলোড হবে, অসঙ্গতি থাকলে ক্রপার ওপেন হবে</span>
          </div>
        </div>
      ) : (
        /* Image uploaded flow */
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-950/20 backdrop-blur-sm">
          
          {/* Header Banner */}
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ImageIcon size={14} className="text-orange-500" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bangla-text">চলতি ফাইল ক্যাটালগ রেশিও</span>
            </div>
            
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 transition"
            >
              <Trash2 size={12} />
              <span className="bangla-text">ছবি মুছুন</span>
            </button>
          </div>

          {/* Body Section for Ideal vs Non-ideal */}
          {!needsCropping ? (
            /* Perfect Aspect Ratio Presentation */
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto max-w-[200px] border border-emerald-500/20 bg-emerald-500/5 p-2 rounded-2xl shadow-sm relative group overflow-hidden">
                <img 
                  src={value} 
                  alt="Correct ratio visualizer" 
                  className="rounded-xl w-full object-contain mx-auto" 
                />
                <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 rounded-xl">
                  <Check size={32} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                  <Check size={11} />
                  <span className="bangla-text">নিখুঁত রেশিও রয়েছে! ক্রপ করার কোনো প্রয়োজন নেই।</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                  Uploaded image matches aspect ratio {aspectRatio === 1 ? '1:1' : aspectRatio === 1.333 ? '4:3' : '16:9'} perfectly.
                </p>
              </div>
            </div>
          ) : (
            /* Aspect Ratio Mismatch - Interactive Cropper Interface */
            <div className="p-4 sm:p-5 space-y-4">
              
              {/* Warnings & Cropping Directions */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <span className="font-bold bangla-text">আপনার ছবিটির রেশিও সঠিক নয়!</span>
                  <p className="font-sans dark:text-amber-500 text-[11px] bangla-text">
                    সুন্দর দেখানোর জন্য ছবিটির অংশবিশেষ ছেঁটে ফেলা প্রয়োজন। আপনার স্বাচ্ছন্দ্যের জন্য দুটি উপায়ে ক্রপ বা সাজাতে পারেন:
                  </p>
                  <ul className="list-disc list-inside mt-1.5 space-y-1 text-[10px] bangla-text">
                    <li><strong className="text-slate-800 dark:text-slate-200">স্বয়ংক্রিয় ক্রপ:</strong> ছবিটি ঠিক মাঝ বরাবর নিখুঁত মাপে কেটে নেওয়া হবে।</li>
                    <li><strong className="text-slate-800 dark:text-slate-200">কাস্টম ফিট টুলের ব্যবহার:</strong> মাউস/আঙুল দিয়ে টেনে অথবা জুম করে নিজের মতো পজিশন করুন।</li>
                  </ul>
                </div>
              </div>

              {/* Mode Toggler */}
              <div className="flex border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setCropOption('auto')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition bangla-text cursor-pointer ${
                    cropOption === 'auto'
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  স্বয়ংক্রিয় ক্রপ (Auto Crop)
                </button>
                <button
                  type="button"
                  onClick={() => setCropOption('manual')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition bangla-text cursor-pointer ${
                    cropOption === 'manual'
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  কাস্টম ফিট ও স্কেল (Manual Pan/Zoom)
                </button>
              </div>

              {/* Visualized Canvas Stage */}
              <div className="space-y-3">
                <div className="border border-slate-350 dark:border-slate-800 rounded-2xl bg-slate-900 overflow-hidden relative flex items-center justify-center p-4">
                  
                  {/* Canvas */}
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUpOrLeave}
                    onMouseLeave={handleCanvasMouseUpOrLeave}
                    onTouchStart={handleCanvasTouchStart}
                    onTouchMove={handleCanvasTouchMove}
                    onTouchEnd={handleCanvasMouseUpOrLeave}
                    className={`max-w-full h-auto rounded-lg shadow-inner max-h-[350px] ${
                      cropOption === 'manual' ? 'cursor-grab active:cursor-grabbing' : ''
                    }`}
                  />

                  {/* Manual Tool Info */}
                  {cropOption === 'manual' && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md text-white rounded-full text-[9px] pointer-events-none tracking-widest uppercase bangla-text">
                      মাউস দিয়ে ড্র্যাগ করুন
                    </div>
                  )}
                </div>

                {/* Display Adjustments controller if manual mode */}
                {cropOption === 'manual' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500 font-sans font-bold bangla-text">জুম বা স্কেল নিয়ন্ত্রণ</span>
                      <span className="text-[10px] font-mono text-orange-500 font-bold">{Math.round(zoom * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                        className="w-7 h-7 bg-white dark:bg-slate-800 border dark:border-slate-700 font-bold hover:bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="flex-1 accent-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom(prev => Math.min(3.0, prev + 0.1))}
                        className="w-7 h-7 bg-white dark:bg-slate-800 border dark:border-slate-700 font-bold hover:bg-slate-100 rounded-lg shrink-0 flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    {/* Reset Translation Coordinates */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setZoom(1); setOffsetX(0); setOffsetY(0); }}
                        className="text-[10px] text-slate-400 hover:text-orange-500 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={10} />
                        <span className="bangla-text">পজিশন রিসেট</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Commit action bar */}
              <div className="flex gap-2.5">
                <button
                  type="button"
                  id="process-apply-crop"
                  onClick={handleApplyCrop}
                  className="flex-1 py-3 px-4 rounded-xl text-xs text-white font-bold bg-gradient-to-r from-orange-500 to-amber-600 shadow-md flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
                >
                  <Crop size={14} />
                  <span className="bangla-text">ক্রপ নিশ্চিত করে লাইভ ক্যাটালগে সেট করুন</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
