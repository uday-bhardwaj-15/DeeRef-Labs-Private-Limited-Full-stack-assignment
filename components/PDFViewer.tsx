// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   ZoomOut,
//   Highlighter,
//   MessageSquare,
//   Trash2,
//   Download,
//   RotateCw,
//   RefreshCw,
//   Copy,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// // Define types for PDF.js
// interface PDFDocumentProxy {
//   numPages: number;
//   getPage(pageNumber: number): Promise<PDFPageProxy>;
// }
// interface PDFPageViewport {
//   width: number;
//   height: number;
//   scale: number;
//   rotation: number;
//   transform: number[]; // 👈 add this
// }

// interface PDFPageProxy {
//   getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
//   render(params: {
//     canvasContext: CanvasRenderingContext2D;
//     viewport: PDFPageViewport;
//   }): { promise: Promise<void> };
//   getTextContent(): Promise<TextContent>;
// }

// interface PDFPageViewport {
//   width: number;
//   height: number;
//   scale: number;
//   rotation: number;
// }

// interface TextContent {
//   items: TextItem[];
// }

// interface TextItem {
//   str: string;
//   dir: string;
//   transform: number[];
//   width: number;
//   height: number;
//   fontName: string;
// }

// interface Highlight {
//   uuid: string;
//   text: string;
//   pageNumber: number;
//   position: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   };
//   color: string;
//   note: string;
// }

// interface PDFViewerProps {
//   pdfUuid: string;
//   title: string;
// }

// export function PDFViewer({ pdfUuid, title }: PDFViewerProps) {
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pageNumber, setPageNumber] = useState<number>(1);
//   const [scale, setScale] = useState<number>(1.2);
//   const [rotation, setRotation] = useState<number>(0);
//   const [highlights, setHighlights] = useState<Highlight[]>([]);
//   const [highlightMode, setHighlightMode] = useState<boolean>(false);
//   const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
//   const [pdfjsLib, setPdfjsLib] = useState<any>(null);
//   const [textContent, setTextContent] = useState<TextContent | null>(null);

//   const { toast } = useToast();
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const textLayerRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Load PDF.js and initialize
//   useEffect(() => {
//     const initializePDFJS = async () => {
//       try {
//         console.log("Loading PDF.js library...");

//         // Dynamic import of PDF.js
//         const pdfjs = await import("pdfjs-dist");

//         // Set worker source
//         if (typeof window !== "undefined") {
//           pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
//         }

//         setPdfjsLib(pdfjs);
//         console.log("PDF.js loaded successfully");

//         // Now load the PDF document
//         await loadPDFDocument(pdfjs);
//       } catch (err) {
//         console.error("Failed to load PDF.js:", err);

//         let message = "Failed to initialize PDF viewer";
//         if (err instanceof Error) {
//           message = `Failed to initialize PDF viewer: ${err.message}`;
//         }

//         setError(message);
//         setLoading(false);
//       }
//     };

//     const loadPDFDocument = async (pdfjs: any) => {
//       if (!pdfUuid) {
//         setError("No PDF UUID provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log("Loading PDF document for UUID:", pdfUuid);

//         const pdfUrl = `/api/pdf/${pdfUuid}`;
//         console.log("PDF URL:", pdfUrl);

//         // Test accessibility first
//         const testResponse = await fetch(pdfUrl, {
//           method: "HEAD",
//           credentials: "same-origin",
//         });

//         if (!testResponse.ok) {
//           throw new Error(
//             `PDF not accessible: ${testResponse.status} ${testResponse.statusText}`
//           );
//         }

//         console.log("PDF endpoint is accessible, loading document...");

//         // Create loading task with proper configuration
//         const loadingTask = pdfjs.getDocument({
//           url: pdfUrl,
//           httpHeaders: {
//             Accept: "application/pdf",
//           },
//           withCredentials: true,
//           // Disable font loading to prevent issues
//           disableFontFace: true,
//           // Disable streaming to ensure compatibility
//           disableStream: true,
//           // Disable auto-fetch to prevent worker issues
//           disableAutoFetch: true,
//         });

//         // Add progress tracking
//         loadingTask.onProgress = (progressData: any) => {
//           console.log(
//             "Loading progress:",
//             Math.round((progressData.loaded / progressData.total) * 100) + "%"
//           );
//         };

//         console.log("Waiting for PDF to load...");
//         const pdf = await loadingTask.promise;

//         console.log("PDF loaded successfully!");
//         console.log("Number of pages:", pdf.numPages);

//         setPdfDoc(pdf);
//         setNumPages(pdf.numPages);
//         setLoading(false);
//       } catch (err: any) {
//         console.error("Error loading PDF document:", err);

//         let errorMessage = "Failed to load PDF document";

//         if (err.name === "InvalidPDFException") {
//           errorMessage = "Invalid PDF file format";
//         } else if (err.name === "MissingPDFException") {
//           errorMessage = "PDF file is missing or corrupted";
//         } else if (err.name === "UnexpectedResponseException") {
//           errorMessage = "Server returned unexpected response";
//         } else if (err.message?.includes("401")) {
//           errorMessage = "Authentication required - please log in again";
//         } else if (err.message?.includes("404")) {
//           errorMessage = "PDF file not found";
//         } else if (err.message?.includes("403")) {
//           errorMessage = "Access denied to PDF file";
//         } else if (err.message) {
//           errorMessage = err.message;
//         }

//         setError(errorMessage);
//         setLoading(false);
//       }
//     };

//     initializePDFJS();
//     loadHighlights();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pdfUuid]);

//   // Render page when dependencies change
//   useEffect(() => {
//     if (pdfDoc && pdfjsLib) {
//       renderPage();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pdfDoc, pageNumber, scale, rotation, pdfjsLib]);

//   const renderPage = async () => {
//     if (!pdfDoc || !canvasRef.current || !pdfjsLib) {
//       console.log("Cannot render: missing dependencies");
//       return;
//     }

//     try {
//       console.log("Rendering page:", pageNumber);

//       const page = await pdfDoc.getPage(pageNumber);
//       const viewport = page.getViewport({ scale, rotation });

//       const canvas = canvasRef.current;
//       const context = canvas.getContext("2d");

//       if (!context) {
//         throw new Error("Could not get 2D rendering context");
//       }

//       // Set canvas dimensions
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       // Clear canvas
//       context.clearRect(0, 0, canvas.width, canvas.height);

//       // Render the page
//       const renderContext = {
//         canvasContext: context,
//         viewport: viewport,
//       };

//       console.log(
//         "Starting page render with viewport:",
//         viewport.width,
//         "x",
//         viewport.height
//       );
//       await page.render(renderContext).promise;
//       console.log("Page rendered successfully");

//       // Get text content for text layer and highlighting
//       const textContentData = await page.getTextContent();
//       setTextContent(textContentData);
//       renderTextLayer(textContentData, viewport);
//     } catch (err: any) {
//       console.error("Error rendering page:", err);
//       toast({
//         title: "Failed to render page",
//         description: err.message || String(err),
//         variant: "destructive",
//       });
//     }
//   };

//   const renderTextLayer = (
//     textContent: TextContent,
//     viewport: PDFPageViewport
//   ) => {
//     if (!textLayerRef.current) return;

//     // Clear previous text layer
//     textLayerRef.current.innerHTML = "";

//     // Create text layer
//     textLayerRef.current.style.left = canvasRef.current!.offsetLeft + "px";
//     textLayerRef.current.style.top = canvasRef.current!.offsetTop + "px";
//     textLayerRef.current.style.width = canvasRef.current!.width + "px";
//     textLayerRef.current.style.height = canvasRef.current!.height + "px";

//     // Render text items
//     textContent.items.forEach((item) => {
//       const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
//       const angle = Math.atan2(tx[1], tx[0]);

//       if (angle !== 0) {
//         // Skip rotated text for simplicity
//         return;
//       }

//       const div = document.createElement("div");
//       div.textContent = item.str;
//       div.style.position = "absolute";
//       div.style.left = `${tx[4]}px`;
//       div.style.top = `${tx[5]}px`;
//       div.style.fontSize = `${Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3])}px`;
//       div.style.transformOrigin = "0% 0%";
//       div.style.lineHeight = "1";
//       div.style.color = "transparent";
//       div.style.cursor = "text";
//       div.style.userSelect = "text";

//       textLayerRef.current!.appendChild(div);
//     });
//   };

//   const loadHighlights = async () => {
//     try {
//       const response = await fetch(`/api/highlights?pdfUuid=${pdfUuid}`, {
//         credentials: "same-origin",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setHighlights(data.highlights || []);
//       }
//     } catch (error) {
//       console.error("Failed to load highlights:", error);
//     }
//   };

//   const changePage = (offset: number) => {
//     setPageNumber((prev) => {
//       const newPage = prev + offset;
//       return Math.min(Math.max(1, newPage), numPages);
//     });
//   };

//   const changeScale = (newScale: number) => {
//     setScale(Math.min(Math.max(0.5, newScale), 3.0));
//   };

//   const rotateDocument = () => {
//     setRotation((prev) => (prev + 90) % 360);
//   };

//   const handleTextSelection = async () => {
//     if (!highlightMode || !textContent) return;

//     const selection = window.getSelection();
//     if (!selection || selection.toString().length === 0) return;

//     const selectedText = selection.toString().trim();
//     if (!selectedText) return;

//     const range = selection.getRangeAt(0);
//     const rect = range.getBoundingClientRect();
//     const textLayerRect = textLayerRef.current!.getBoundingClientRect();

//     const position = {
//       x: (rect.left - textLayerRect.left) / scale,
//       y: (rect.top - textLayerRect.top) / scale,
//       width: rect.width / scale,
//       height: rect.height / scale,
//     };

//     await createHighlight(selectedText, position);
//     selection.removeAllRanges();
//   };

//   const createHighlight = async (text: string, position: any) => {
//     try {
//       const response = await fetch("/api/highlights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "same-origin",
//         body: JSON.stringify({
//           pdfUuid,
//           pageNumber,
//           text,
//           position,
//           color: "#ffeb3b",
//           note: "",
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setHighlights((prev) => [...prev, data.highlight]);
//         toast({ title: "Highlight created successfully" });
//       } else {
//         throw new Error(`Failed to create highlight: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Failed to create highlight:", error);
//       toast({ title: "Failed to create highlight", variant: "destructive" });
//     }
//   };

//   const copySelectedText = () => {
//     const selection = window.getSelection();
//     if (selection && selection.toString().length > 0) {
//       navigator.clipboard
//         .writeText(selection.toString())
//         .then(() => {
//           toast({ title: "Text copied to clipboard" });
//         })
//         .catch((err) => {
//           console.error("Failed to copy text: ", err);
//           toast({ title: "Failed to copy text", variant: "destructive" });
//         });
//     } else {
//       toast({ title: "No text selected" });
//     }
//   };

//   const deleteHighlight = async (highlightUuid: string) => {
//     try {
//       const response = await fetch(`/api/highlights/${highlightUuid}`, {
//         method: "DELETE",
//         credentials: "same-origin",
//       });

//       if (response.ok) {
//         setHighlights((prev) => prev.filter((h) => h.uuid !== highlightUuid));
//         toast({ title: "Highlight deleted successfully" });
//       }
//     } catch (error) {
//       console.error("Failed to delete highlight:", error);
//       toast({ title: "Failed to delete highlight", variant: "destructive" });
//     }
//   };

//   const downloadPDF = () => {
//     const link = document.createElement("a");
//     link.href = `/api/pdf/${pdfUuid}`;
//     link.download = `${title}.pdf`;
//     link.click();
//   };

//   const retryLoad = () => {
//     setError(null);
//     setLoading(true);
//     setPdfDoc(null);
//     window.location.reload();
//   };

//   const currentPageHighlights = highlights.filter(
//     (h) => h.pageNumber === pageNumber
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center p-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             Loading PDF...
//           </h3>
//           <p className="text-gray-600">
//             Please wait while we load your document
//           </p>
//           <div className="mt-4 text-sm text-gray-500">
//             <p>UUID: {pdfUuid}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-lg">
//           <div className="text-red-600 mb-6">
//             <svg
//               className="h-16 w-16 mx-auto mb-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <h3 className="text-xl font-semibold mb-2">Failed to Load PDF</h3>
//             <p className="text-gray-600 mb-4">{error}</p>
//           </div>

//           <div className="space-y-3">
//             <Button onClick={retryLoad} className="w-full">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Retry Loading
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => window.history.back()}
//               className="w-full"
//             >
//               Go Back
//             </Button>
//           </div>

//           <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
//             <div className="text-left space-y-2">
//               <p>
//                 <strong>PDF UUID:</strong> {pdfUuid}
//               </p>
//               <p>
//                 <strong>API Endpoint:</strong> /api/pdf/{pdfUuid}
//               </p>
//               <div className="mt-3">
//                 <p className="font-medium mb-1">Troubleshooting Steps:</p>
//                 <ul className="list-disc list-inside space-y-1">
//                   <li>Check if you&apos;re logged in</li>
//                   <li>Verify PDF file exists</li>
//                   <li>Check browser console for errors</li>
//                   <li>Try refreshing the page</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
//         <h1 className="text-lg font-semibold text-gray-900 max-w-md truncate">
//           {title}
//         </h1>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant={highlightMode ? "default" : "outline"}
//             size="sm"
//             onClick={() => setHighlightMode(!highlightMode)}
//             className="flex items-center space-x-2"
//           >
//             <Highlighter className="h-4 w-4" />
//             <span>Highlight</span>
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={copySelectedText}
//             title="Copy Selected Text"
//           >
//             <Copy className="h-4 w-4" />
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={rotateDocument}
//             title="Rotate 90°"
//           >
//             <RotateCw className="h-4 w-4" />
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={downloadPDF}
//             title="Download PDF"
//           >
//             <Download className="h-4 w-4" />
//           </Button>

//           <div className="flex items-center space-x-2 border-l pl-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => changeScale(scale - 0.2)}
//               disabled={scale <= 0.5}
//             >
//               <ZoomOut className="h-4 w-4" />
//             </Button>

//             <span className="text-sm text-gray-600 min-w-16 text-center">
//               {Math.round(scale * 100)}%
//             </span>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => changeScale(scale + 0.2)}
//               disabled={scale >= 3.0}
//             >
//               <ZoomIn className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => changePage(-1)}
//             disabled={pageNumber <= 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <Input
//             type="number"
//             value={pageNumber}
//             onChange={(e) => {
//               const page = parseInt(e.target.value);
//               if (page >= 1 && page <= numPages) {
//                 setPageNumber(page);
//               }
//             }}
//             className="w-16 text-center"
//             min={1}
//             max={numPages}
//           />

//           <span className="text-sm text-gray-600">of {numPages}</span>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => changePage(1)}
//             disabled={pageNumber >= numPages}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* PDF Viewer */}
//         <div className="flex-1 flex flex-col items-center overflow-auto p-4">
//           <div className="relative shadow-lg" ref={containerRef}>
//             <canvas
//               ref={canvasRef}
//               className="border border-gray-300 max-w-full h-auto"
//             />

//             {/* Text Layer for selection and copying */}
//             <div
//               ref={textLayerRef}
//               className="absolute overflow-hidden text-layer"
//               style={{
//                 mixBlendMode: "multiply",
//                 pointerEvents: highlightMode ? "auto" : "none",
//                 userSelect: highlightMode ? "text" : "none",
//               }}
//               onMouseUp={handleTextSelection}
//             />

//             {/* Render highlights */}
//             {currentPageHighlights.map((highlight) => (
//               <div
//                 key={highlight.uuid}
//                 className="absolute cursor-pointer group border-2 border-opacity-60 hover:border-opacity-100"
//                 style={{
//                   left: `${highlight.position.x * scale}px`,
//                   top: `${highlight.position.y * scale}px`,
//                   width: `${highlight.position.width * scale}px`,
//                   height: `${highlight.position.height * scale}px`,
//                   backgroundColor: `${highlight.color}40`,
//                   borderColor: highlight.color,
//                 }}
//                 title={highlight.text}
//                 onClick={() => setSelectedHighlight(highlight)}
//               >
//                 <div className="absolute -top-8 left-0 hidden group-hover:block bg-black text-white text-xs p-1 rounded max-w-xs z-10">
//                   {highlight.text.substring(0, 100)}...
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Highlights Sidebar */}
//         <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
//           <div className="p-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Highlights ({highlights.length})
//             </h3>

//             <div className="space-y-3">
//               {highlights.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                   <p>No highlights yet</p>
//                   <p className="text-sm">
//                     Enable highlight mode and select text
//                   </p>
//                 </div>
//               ) : (
//                 highlights.map((highlight) => (
//                   <div
//                     key={highlight.uuid}
//                     className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
//                     onClick={() => setPageNumber(highlight.pageNumber)}
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <span className="text-xs text-gray-500">
//                         Page {highlight.pageNumber}
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteHighlight(highlight.uuid);
//                         }}
//                         className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>

//                     <p className="text-sm text-gray-800 line-clamp-3 mb-2">
//                       {highlight.text}
//                     </p>

//                     {highlight.note && (
//                       <div className="flex items-start space-x-2 mt-2 p-2 bg-gray-100 rounded">
//                         <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
//                         <p className="text-sm text-gray-600">
//                           {highlight.note}
//                         </p>
//                       </div>
//                     )}

//                     <div
//                       className="w-full h-1 rounded mt-2"
//                       style={{ backgroundColor: highlight.color }}
//                     />
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// {fake worker error}
// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ZoomIn,
//   ZoomOut,
//   Highlighter,
//   MessageSquare,
//   Trash2,
//   Download,
//   RotateCw,
//   RefreshCw,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// // Define types for PDF.js
// interface PDFDocumentProxy {
//   numPages: number;
//   getPage(pageNumber: number): Promise<PDFPageProxy>;
// }

// interface PDFPageProxy {
//   getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
//   render(params: {
//     canvasContext: CanvasRenderingContext2D;
//     viewport: PDFPageViewport;
//   }): { promise: Promise<void> };
//   getTextContent(): Promise<any>;
// }

// interface PDFPageViewport {
//   width: number;
//   height: number;
//   scale: number;
//   rotation: number;
// }

// interface Highlight {
//   uuid: string;
//   text: string;
//   pageNumber: number;
//   position: {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//   };
//   color: string;
//   note: string;
// }

// interface PDFViewerProps {
//   pdfUuid: string;
//   title: string;
// }

// export function PDFViewer({ pdfUuid, title }: PDFViewerProps) {
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pageNumber, setPageNumber] = useState<number>(1);
//   const [scale, setScale] = useState<number>(1.2);
//   const [rotation, setRotation] = useState<number>(0);
//   const [highlights, setHighlights] = useState<Highlight[]>([]);
//   const [highlightMode, setHighlightMode] = useState<boolean>(false);
//   const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
//     null
//   );
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
//   const [pdfjsLib, setPdfjsLib] = useState<any>(null);

//   const { toast } = useToast();
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Load PDF.js and initialize
//   useEffect(() => {
//     const initializePDFJS = async () => {
//       try {
//         console.log("Loading PDF.js library...");

//         // Dynamic import of PDF.js
//         const pdfjs = await import("pdfjs-dist");

//         // Set worker source - use the same version as the API
//         if (typeof window !== "undefined") {
//           pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js`;
//         }

//         setPdfjsLib(pdfjs);
//         console.log("PDF.js loaded successfully");

//         // Now load the PDF document
//         await loadPDFDocument(pdfjs);
//       } catch (err) {
//         console.error("Failed to load PDF.js:", err);
//         setError(`Failed to initialize PDF viewer: ${err.message}`);
//         setLoading(false);
//       }
//     };

//     const loadPDFDocument = async (pdfjs: any) => {
//       if (!pdfUuid) {
//         setError("No PDF UUID provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         console.log("Loading PDF document for UUID:", pdfUuid);

//         const pdfUrl = `/api/pdf/${pdfUuid}`;
//         console.log("PDF URL:", pdfUrl);

//         // Test accessibility first
//         const testResponse = await fetch(pdfUrl, {
//           method: "HEAD",
//           credentials: "same-origin",
//         });

//         if (!testResponse.ok) {
//           throw new Error(
//             `PDF not accessible: ${testResponse.status} ${testResponse.statusText}`
//           );
//         }

//         console.log("PDF endpoint is accessible, loading document...");

//         // Create loading task with proper configuration
//         const loadingTask = pdfjs.getDocument({
//           url: pdfUrl,
//           httpHeaders: {
//             Accept: "application/pdf",
//           },
//           withCredentials: true,
//           // Disable font loading to prevent issues
//           disableFontFace: true,
//           // Disable streaming to ensure compatibility
//           disableStream: true,
//           // Disable auto-fetch to prevent worker issues
//           disableAutoFetch: true,
//         });

//         // Add progress tracking
//         loadingTask.onProgress = (progressData: any) => {
//           console.log(
//             "Loading progress:",
//             Math.round((progressData.loaded / progressData.total) * 100) + "%"
//           );
//         };

//         console.log("Waiting for PDF to load...");
//         const pdf = await loadingTask.promise;

//         console.log("PDF loaded successfully!");
//         console.log("Number of pages:", pdf.numPages);

//         setPdfDoc(pdf);
//         setNumPages(pdf.numPages);
//         setLoading(false);
//       } catch (err: any) {
//         console.error("Error loading PDF document:", err);

//         let errorMessage = "Failed to load PDF document";

//         if (err.name === "InvalidPDFException") {
//           errorMessage = "Invalid PDF file format";
//         } else if (err.name === "MissingPDFException") {
//           errorMessage = "PDF file is missing or corrupted";
//         } else if (err.name === "UnexpectedResponseException") {
//           errorMessage = "Server returned unexpected response";
//         } else if (err.message?.includes("401")) {
//           errorMessage = "Authentication required - please log in again";
//         } else if (err.message?.includes("404")) {
//           errorMessage = "PDF file not found";
//         } else if (err.message?.includes("403")) {
//           errorMessage = "Access denied to PDF file";
//         } else if (err.message) {
//           errorMessage = err.message;
//         }

//         setError(errorMessage);
//         setLoading(false);
//       }
//     };

//     initializePDFJS();
//     loadHighlights();
//   }, [pdfUuid]);

//   // Render page when dependencies change
//   useEffect(() => {
//     if (pdfDoc && pdfjsLib) {
//       renderPage();
//     }
//   }, [pdfDoc, pageNumber, scale, rotation, pdfjsLib]);

//   const renderPage = async () => {
//     if (!pdfDoc || !canvasRef.current || !pdfjsLib) {
//       console.log("Cannot render: missing dependencies");
//       return;
//     }

//     try {
//       console.log("Rendering page:", pageNumber);

//       const page = await pdfDoc.getPage(pageNumber);
//       const viewport = page.getViewport({ scale, rotation });

//       const canvas = canvasRef.current;
//       const context = canvas.getContext("2d");

//       if (!context) {
//         throw new Error("Could not get 2D rendering context");
//       }

//       // Set canvas dimensions
//       canvas.height = viewport.height;
//       canvas.width = viewport.width;

//       // Clear canvas
//       context.clearRect(0, 0, canvas.width, canvas.height);

//       // Render the page
//       const renderContext = {
//         canvasContext: context,
//         viewport: viewport,
//       };

//       console.log(
//         "Starting page render with viewport:",
//         viewport.width,
//         "x",
//         viewport.height
//       );
//       await page.render(renderContext).promise;
//       console.log("Page rendered successfully");
//     } catch (err: any) {
//       console.error("Error rendering page:", err);
//       toast({
//         title: "Failed to render page",
//         description: err.message || String(err),
//         variant: "destructive",
//       });
//     }
//   };

//   const loadHighlights = async () => {
//     try {
//       const response = await fetch(`/api/highlights?pdfUuid=${pdfUuid}`, {
//         credentials: "same-origin",
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setHighlights(data.highlights || []);
//       }
//     } catch (error) {
//       console.error("Failed to load highlights:", error);
//     }
//   };

//   const changePage = (offset: number) => {
//     setPageNumber((prev) => {
//       const newPage = prev + offset;
//       return Math.min(Math.max(1, newPage), numPages);
//     });
//   };

//   const changeScale = (newScale: number) => {
//     setScale(Math.min(Math.max(0.5, newScale), 3.0));
//   };

//   const rotateDocument = () => {
//     setRotation((prev) => (prev + 90) % 360);
//   };

//   const handleCanvasMouseUp = async () => {
//     if (!highlightMode || !pdfDoc) return;

//     const selection = window.getSelection();
//     if (selection && selection.toString().length > 0) {
//       const text = selection.toString().trim();
//       if (text) {
//         const range = selection.getRangeAt(0);
//         const rect = range.getBoundingClientRect();
//         const canvasRect = canvasRef.current?.getBoundingClientRect();

//         if (canvasRect) {
//           const position = {
//             x: (rect.left - canvasRect.left) / scale,
//             y: (rect.top - canvasRect.top) / scale,
//             width: rect.width / scale,
//             height: rect.height / scale,
//           };

//           await createHighlight(text, position);
//         }
//       }

//       selection.removeAllRanges();
//     }
//   };

//   const createHighlight = async (text: string, position: any) => {
//     try {
//       const response = await fetch("/api/highlights", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "same-origin",
//         body: JSON.stringify({
//           pdfUuid,
//           pageNumber,
//           text,
//           position,
//           color: "#ffeb3b",
//           note: "",
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setHighlights((prev) => [...prev, data.highlight]);
//         toast({ title: "Highlight created successfully" });
//       } else {
//         throw new Error(`Failed to create highlight: ${response.statusText}`);
//       }
//     } catch (error) {
//       console.error("Failed to create highlight:", error);
//       toast({ title: "Failed to create highlight", variant: "destructive" });
//     }
//   };

//   const deleteHighlight = async (highlightUuid: string) => {
//     try {
//       const response = await fetch(`/api/highlights/${highlightUuid}`, {
//         method: "DELETE",
//         credentials: "same-origin",
//       });

//       if (response.ok) {
//         setHighlights((prev) => prev.filter((h) => h.uuid !== highlightUuid));
//         toast({ title: "Highlight deleted successfully" });
//       }
//     } catch (error) {
//       console.error("Failed to delete highlight:", error);
//       toast({ title: "Failed to delete highlight", variant: "destructive" });
//     }
//   };

//   const downloadPDF = () => {
//     const link = document.createElement("a");
//     link.href = `/api/pdf/${pdfUuid}`;
//     link.download = `${title}.pdf`;
//     link.click();
//   };

//   const retryLoad = () => {
//     setError(null);
//     setLoading(true);
//     setPdfDoc(null);
//     window.location.reload();
//   };

//   const currentPageHighlights = highlights.filter(
//     (h) => h.pageNumber === pageNumber
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center p-8">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">
//             Loading PDF...
//           </h3>
//           <p className="text-gray-600">
//             Please wait while we load your document
//           </p>
//           <div className="mt-4 text-sm text-gray-500">
//             <p>UUID: {pdfUuid}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-lg">
//           <div className="text-red-600 mb-6">
//             <svg
//               className="h-16 w-16 mx-auto mb-4"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//               />
//             </svg>
//             <h3 className="text-xl font-semibold mb-2">Failed to Load PDF</h3>
//             <p className="text-gray-600 mb-4">{error}</p>
//           </div>

//           <div className="space-y-3">
//             <Button onClick={retryLoad} className="w-full">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Retry Loading
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() => window.history.back()}
//               className="w-full"
//             >
//               Go Back
//             </Button>
//           </div>

//           <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
//             <div className="text-left space-y-2">
//               <p>
//                 <strong>PDF UUID:</strong> {pdfUuid}
//               </p>
//               <p>
//                 <strong>API Endpoint:</strong> /api/pdf/{pdfUuid}
//               </p>
//               <div className="mt-3">
//                 <p className="font-medium mb-1">Troubleshooting Steps:</p>
//                 <ul className="list-disc list-inside space-y-1">
//                   <li>Check if you're logged in</li>
//                   <li>Verify PDF file exists</li>
//                   <li>Check browser console for errors</li>
//                   <li>Try refreshing the page</li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
//         <h1 className="text-lg font-semibold text-gray-900 max-w-md truncate">
//           {title}
//         </h1>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant={highlightMode ? "default" : "outline"}
//             size="sm"
//             onClick={() => setHighlightMode(!highlightMode)}
//             className="flex items-center space-x-2"
//           >
//             <Highlighter className="h-4 w-4" />
//             <span>Highlight</span>
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={rotateDocument}
//             title="Rotate 90°"
//           >
//             <RotateCw className="h-4 w-4" />
//           </Button>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={downloadPDF}
//             title="Download PDF"
//           >
//             <Download className="h-4 w-4" />
//           </Button>

//           <div className="flex items-center space-x-2 border-l pl-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => changeScale(scale - 0.2)}
//               disabled={scale <= 0.5}
//             >
//               <ZoomOut className="h-4 w-4" />
//             </Button>

//             <span className="text-sm text-gray-600 min-w-16 text-center">
//               {Math.round(scale * 100)}%
//             </span>

//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => changeScale(scale + 0.2)}
//               disabled={scale >= 3.0}
//             >
//               <ZoomIn className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="flex items-center space-x-2">
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => changePage(-1)}
//             disabled={pageNumber <= 1}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </Button>

//           <Input
//             type="number"
//             value={pageNumber}
//             onChange={(e) => {
//               const page = parseInt(e.target.value);
//               if (page >= 1 && page <= numPages) {
//                 setPageNumber(page);
//               }
//             }}
//             className="w-16 text-center"
//             min={1}
//             max={numPages}
//           />

//           <span className="text-sm text-gray-600">of {numPages}</span>

//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => changePage(1)}
//             disabled={pageNumber >= numPages}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* PDF Viewer */}
//         <div className="flex-1 flex flex-col items-center overflow-auto p-4">
//           <div className="relative shadow-lg" ref={containerRef}>
//             <canvas
//               ref={canvasRef}
//               onMouseUp={handleCanvasMouseUp}
//               className="border border-gray-300 cursor-text max-w-full h-auto"
//               style={{
//                 userSelect: highlightMode ? "text" : "none",
//               }}
//             />

//             {/* Render highlights */}
//             {currentPageHighlights.map((highlight) => (
//               <div
//                 key={highlight.uuid}
//                 className="absolute cursor-pointer group border-2 border-opacity-60 hover:border-opacity-100"
//                 style={{
//                   left: `${highlight.position.x * scale}px`,
//                   top: `${highlight.position.y * scale}px`,
//                   width: `${highlight.position.width * scale}px`,
//                   height: `${highlight.position.height * scale}px`,
//                   backgroundColor: `${highlight.color}40`,
//                   borderColor: highlight.color,
//                 }}
//                 title={highlight.text}
//                 onClick={() => setSelectedHighlight(highlight)}
//               >
//                 <div className="absolute -top-8 left-0 hidden group-hover:block bg-black text-white text-xs p-1 rounded max-w-xs z-10">
//                   {highlight.text.substring(0, 100)}...
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Highlights Sidebar */}
//         <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
//           <div className="p-4">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Highlights ({highlights.length})
//             </h3>

//             <div className="space-y-3">
//               {highlights.length === 0 ? (
//                 <div className="text-center py-8 text-gray-500">
//                   <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-50" />
//                   <p>No highlights yet</p>
//                   <p className="text-sm">
//                     Enable highlight mode and select text
//                   </p>
//                 </div>
//               ) : (
//                 highlights.map((highlight) => (
//                   <div
//                     key={highlight.uuid}
//                     className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
//                     onClick={() => setPageNumber(highlight.pageNumber)}
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <span className="text-xs text-gray-500">
//                         Page {highlight.pageNumber}
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteHighlight(highlight.uuid);
//                         }}
//                         className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>

//                     <p className="text-sm text-gray-800 line-clamp-3 mb-2">
//                       {highlight.text}
//                     </p>

//                     {highlight.note && (
//                       <div className="flex items-start space-x-2 mt-2 p-2 bg-gray-100 rounded">
//                         <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
//                         <p className="text-sm text-gray-600">
//                           {highlight.note}
//                         </p>
//                       </div>
//                     )}

//                     <div
//                       className="w-full h-1 rounded mt-2"
//                       style={{ backgroundColor: highlight.color }}
//                     />
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  MessageSquare,
  Trash2,
  Download,
  RotateCw,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define types for PDF.js
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFPageViewport {
  width: number;
  height: number;
  scale: number;
  rotation: number;
  transform: number[];
}

interface PDFPageProxy {
  getViewport(params: { scale: number; rotation?: number }): PDFPageViewport;
  render(params: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PDFPageViewport;
  }): { promise: Promise<void> };
  getTextContent(): Promise<TextContent>;
}

interface TextContent {
  items: TextItem[];
}

interface TextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

interface Highlight {
  uuid: string;
  text: string;
  pageNumber: number;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  note: string;
}

interface PDFViewerProps {
  pdfUuid: string;
  title: string;
  filePath?: string;
}

export function PDFViewer({ pdfUuid, title, filePath }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [highlightMode, setHighlightMode] = useState<boolean>(false);
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<any>(null);
  const [textContent, setTextContent] = useState<TextContent | null>(null);

  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF.js and initialize
  // useEffect(() => {
  //   const initializePDFJS = async () => {
  //     try {
  //       console.log("Loading PDF.js library...");

  //       // Dynamic import of PDF.js
  //       const pdfjs = await import("pdfjs-dist");

  //       // Set worker source
  //       if (typeof window !== "undefined") {
  //         pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  //       }

  //       setPdfjsLib(pdfjs);
  //       console.log("PDF.js loaded successfully");

  //       // Now load the PDF document
  //       await loadPDFDocument(pdfjs);
  //     } catch (err) {
  //       console.error("Failed to load PDF.js:", err);

  //       let message = "Failed to initialize PDF viewer";
  //       if (err instanceof Error) {
  //         message = `Failed to initialize PDF viewer: ${err.message}`;
  //       }

  //       setError(message);
  //       setLoading(false);
  //     }
  //   };

  //   const loadPDFDocument = async (pdfjs: any) => {
  //     if (!pdfUuid) {
  //       setError("No PDF UUID provided");
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       console.log("Loading PDF document for UUID:", pdfUuid);

  //       const pdfUrl = `/api/pdf/${pdfUuid}`;
  //       console.log("PDF URL:", pdfUrl);

  //       // Test accessibility first
  //       const testResponse = await fetch(pdfUrl, {
  //         method: "HEAD",
  //         credentials: "same-origin",
  //       });

  //       if (!testResponse.ok) {
  //         throw new Error(
  //           `PDF not accessible: ${testResponse.status} ${testResponse.statusText}`
  //         );
  //       }

  //       console.log("PDF endpoint is accessible, loading document...");

  //       // Create loading task with proper configuration
  //       const loadingTask = pdfjs.getDocument({
  //         url: pdfUrl,
  //         httpHeaders: {
  //           Accept: "application/pdf",
  //         },
  //         withCredentials: true,
  //         disableFontFace: false, // Enable font loading for better text rendering
  //         disableStream: true,
  //         disableAutoFetch: true,
  //       });

  //       // Add progress tracking
  //       loadingTask.onProgress = (progressData: any) => {
  //         console.log(
  //           "Loading progress:",
  //           Math.round((progressData.loaded / progressData.total) * 100) + "%"
  //         );
  //       };

  //       console.log("Waiting for PDF to load...");
  //       const pdf = await loadingTask.promise;

  //       console.log("PDF loaded successfully!");
  //       console.log("Number of pages:", pdf.numPages);

  //       setPdfDoc(pdf);
  //       setNumPages(pdf.numPages);
  //       setLoading(false);
  //     } catch (err: any) {
  //       console.error("Error loading PDF document:", err);

  //       let errorMessage = "Failed to load PDF document";

  //       if (err.name === "InvalidPDFException") {
  //         errorMessage = "Invalid PDF file format";
  //       } else if (err.name === "MissingPDFException") {
  //         errorMessage = "PDF file is missing or corrupted";
  //       } else if (err.name === "UnexpectedResponseException") {
  //         errorMessage = "Server returned unexpected response";
  //       } else if (err.message?.includes("401")) {
  //         errorMessage = "Authentication required - please log in again";
  //       } else if (err.message?.includes("404")) {
  //         errorMessage = "PDF file not found";
  //       } else if (err.message?.includes("403")) {
  //         errorMessage = "Access denied to PDF file";
  //       } else if (err.message) {
  //         errorMessage = err.message;
  //       }

  //       setError(errorMessage);
  //       setLoading(false);
  //     }
  //   };

  //   initializePDFJS();
  //   loadHighlights();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pdfUuid]);
  useEffect(() => {
    const initializePDFJS = async () => {
      try {
        // console.log("Loading PDF.js library...");

        // Dynamic import of PDF.js
        const pdfjs = await import("pdfjs-dist");

        // Set worker source
        if (typeof window !== "undefined") {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }

        setPdfjsLib(pdfjs);
        console.log("PDF.js loaded successfully");

        // Now load the PDF document
        await loadPDFDocument(pdfjs);
      } catch (err) {
        console.error("Failed to load PDF.js:", err);

        let message = "Failed to initialize PDF viewer";
        if (err instanceof Error) {
          message = `Failed to initialize PDF viewer: ${err.message}`;
        }

        setError(message);
        setLoading(false);
      }
    };

    // const loadPDFDocument = async (pdfjs: any) => {
    //   if (!pdfUuid) {
    //     setError("No PDF UUID provided");
    //     setLoading(false);
    //     return;
    //   }

    //   try {
    //     console.log("Loading PDF document for UUID:", pdfUuid);
    //     console.log("File path:", filePath);

    //     // Determine the PDF URL with a default fallback
    //     let pdfUrl: string = `/api/pdf/${pdfUuid}`;

    //     // If filePath is provided, use it instead
    //     if (filePath) {
    //       // Make relative paths absolute
    //       pdfUrl =
    //         filePath.startsWith("http") || filePath.startsWith("/")
    //           ? filePath
    //           : `/${filePath}`;
    //     }

    //     console.log("Final PDF URL:", pdfUrl);

    //     // Test accessibility first
    //     const testResponse = await fetch(pdfUrl, {
    //       method: "HEAD",
    //       credentials: "same-origin",
    //     });

    //     if (!testResponse.ok) {
    //       throw new Error(
    //         `PDF not accessible: ${testResponse.status} ${testResponse.statusText}`
    //       );
    //     }

    //     console.log("PDF endpoint is accessible, loading document...");

    //     // Create loading task with proper configuration
    //     const loadingTask = pdfjs.getDocument({
    //       url: pdfUrl,
    //       httpHeaders: {
    //         Accept: "application/pdf",
    //       },
    //       withCredentials: true,
    //       disableFontFace: false,
    //       disableStream: true,
    //       disableAutoFetch: true,
    //     });

    //     // Add progress tracking
    //     loadingTask.onProgress = (progressData: any) => {
    //       console.log(
    //         "Loading progress:",
    //         Math.round((progressData.loaded / progressData.total) * 100) + "%"
    //       );
    //     };

    //     console.log("Waiting for PDF to load...");
    //     const pdf = await loadingTask.promise;

    //     console.log("PDF loaded successfully!");
    //     console.log("Number of pages:", pdf.numPages);

    //     setPdfDoc(pdf);
    //     setNumPages(pdf.numPages);
    //     setLoading(false);
    //   } catch (err: any) {
    //     console.error("Error loading PDF document:", err);

    //     let errorMessage = "Failed to load PDF document";

    //     if (err.name === "InvalidPDFException") {
    //       errorMessage = "Invalid PDF file format";
    //     } else if (err.name === "MissingPDFException") {
    //       errorMessage = "PDF file is missing or corrupted";
    //     } else if (err.name === "UnexpectedResponseException") {
    //       errorMessage = "Server returned unexpected response";
    //     } else if (err.message?.includes("401")) {
    //       errorMessage = "Authentication required - please log in again";
    //     } else if (err.message?.includes("404")) {
    //       errorMessage = "PDF file not found";
    //     } else if (err.message?.includes("403")) {
    //       errorMessage = "Access denied to PDF file";
    //     } else if (err.message) {
    //       errorMessage = err.message;
    //     }

    //     setError(errorMessage);
    //     setLoading(false);
    //   }
    // };
    const loadPDFDocument = async (pdfjs: any) => {
      if (!pdfUuid) {
        setError("No PDF UUID provided");
        setLoading(false);
        return;
      }

      try {
        // console.log("Loading PDF document for UUID:", pdfUuid);
        // console.log("File path from Vercel Blob:", filePath);

        let pdfUrl;

        // ✅ Handle Vercel Blob URLs
        if (filePath) {
          // If it's a Vercel Blob URL (starts with blob: or https://)
          if (filePath.startsWith("blob:") || filePath.startsWith("https://")) {
            pdfUrl = filePath;
            // console.log("Using Vercel Blob URL:", pdfUrl);
          }
          // If it's a relative path (local development)
          else if (filePath.startsWith("/")) {
            pdfUrl = filePath;
            // console.log("Using local file path:", pdfUrl);
          }
          // If it's just a filename
          else {
            pdfUrl = `/uploads/${filePath}`;
            // console.log("Using uploads path:", pdfUrl);
          }
        } else {
          // Fallback to API endpoint if no filePath
          pdfUrl = `/api/pdf/${pdfUuid}`;
          // console.log("Using API endpoint:", pdfUrl);
        }

        // console.log("Final PDF URL:", pdfUrl);

        // For blob URLs, we need different configuration
        const loadingConfig: any = {
          url: pdfUrl,
          disableFontFace: false,
          disableStream: true,
          disableAutoFetch: true,
        };

        // Only add credentials for same-origin requests, not for blob URLs
        if (!pdfUrl.startsWith("blob:") && !pdfUrl.startsWith("https://")) {
          loadingConfig.withCredentials = true;
          loadingConfig.httpHeaders = {
            Accept: "application/pdf",
          };
        }

        const loadingTask = pdfjs.getDocument(loadingConfig);

        // Add progress tracking
        loadingTask.onProgress = (progressData: any) => {
          // console.log(
          //   "Loading progress:",
          //   Math.round((progressData.loaded / progressData.total) * 100) + "%"
          // );
        };

        // console.log("Waiting for PDF to load...");
        const pdf = await loadingTask.promise;

        // console.log("PDF loaded successfully!");
        // console.log("Number of pages:", pdf.numPages);

        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error("Error loading PDF document:", err);
        // ... error handling
      }
    };
    initializePDFJS();
    loadHighlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUuid, filePath]); // ✅ Add filePath to dependencies

  // Render page when dependencies change
  useEffect(() => {
    if (pdfDoc && pdfjsLib) {
      renderPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNumber, scale, rotation, pdfjsLib]);

  const renderPage = async () => {
    if (!pdfDoc || !canvasRef.current || !pdfjsLib) {
      // console.log("Cannot render: missing dependencies");
      return;
    }

    try {
      // console.log("Rendering page:", pageNumber);

      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale, rotation });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get 2D rendering context");
      }

      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // console.log(
      //   "Starting page render with viewport:",
      //   viewport.width,
      //   "x",
      //   viewport.height
      // );
      await page.render(renderContext).promise;
      // console.log("Page rendered successfully");

      // Get text content for text layer and highlighting
      const textContentData = await page.getTextContent();
      setTextContent(textContentData);
      renderTextLayer(textContentData, viewport);
    } catch (err: any) {
      console.error("Error rendering page:", err);
      toast({
        title: "Failed to render page",
        description: err.message || String(err),
        variant: "destructive",
      });
    }
  };

  const renderTextLayer = (
    textContent: TextContent,
    viewport: PDFPageViewport
  ) => {
    if (!textLayerRef.current || !canvasRef.current) return;

    // Clear previous text layer
    textLayerRef.current.innerHTML = "";

    // Get canvas position
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    // Position text layer to match canvas exactly
    textLayerRef.current.style.position = "absolute";
    textLayerRef.current.style.left = "0px";
    textLayerRef.current.style.top = "0px";
    textLayerRef.current.style.width = canvasRef.current.width + "px";
    textLayerRef.current.style.height = canvasRef.current.height + "px";
    textLayerRef.current.style.overflow = "hidden";
    textLayerRef.current.style.opacity = "0.2"; // Make it slightly visible for debugging
    textLayerRef.current.style.lineHeight = "1.0";

    // Create text items with proper positioning
    textContent.items.forEach((item, index) => {
      if (!item.str || item.str.trim().length === 0) return;

      // Get the transformation matrix for this text item
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);

      // Calculate position and dimensions
      const left = tx[4];
      const top = tx[5];
      const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
      const fontAscent = fontHeight * 0.8; // Approximate ascent

      // Create text div
      const textDiv = document.createElement("div");
      textDiv.textContent = item.str;
      textDiv.style.position = "absolute";
      textDiv.style.left = left + "px";
      textDiv.style.top = top - fontAscent + "px"; // Adjust for baseline
      textDiv.style.fontSize = fontHeight + "px";
      textDiv.style.fontFamily = "sans-serif"; // Use system font for consistency
      textDiv.style.color = "transparent";
      textDiv.style.userSelect = "text";
      textDiv.style.cursor = "text";
      textDiv.style.whiteSpace = "pre";
      textDiv.style.transformOrigin = "0% 0%";
      textDiv.style.lineHeight = "1.0";

      // Handle rotation if needed
      const angle = Math.atan2(tx[1], tx[0]);
      if (Math.abs(angle) > 0.1) {
        textDiv.style.transform = `rotate(${angle}rad)`;
      }

      textLayerRef.current!.appendChild(textDiv);
    });

    // Add a debug overlay to show text layer bounds
    const debugDiv = document.createElement("div");
    debugDiv.style.position = "absolute";
    debugDiv.style.top = "0";
    debugDiv.style.left = "0";
    debugDiv.style.width = "100%";
    debugDiv.style.height = "100%";
    debugDiv.style.border = "1px solid rgba(255, 0, 0, 0.3)";
    debugDiv.style.pointerEvents = "none";
    debugDiv.style.zIndex = "1000";
    textLayerRef.current.appendChild(debugDiv);
  };

  const loadHighlights = async () => {
    try {
      const response = await fetch(`/api/highlights?pdfUuid=${pdfUuid}`, {
        credentials: "same-origin",
      });
      if (response.ok) {
        const data = await response.json();
        setHighlights(data.highlights || []);
      }
    } catch (error) {
      console.error("Failed to load highlights:", error);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber((prev) => {
      const newPage = prev + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const changeScale = (newScale: number) => {
    setScale(Math.min(Math.max(0.5, newScale), 3.0));
  };

  const rotateDocument = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleTextSelection = async () => {
    if (!highlightMode || !textContent) return;

    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const canvasRect = canvasRef.current!.getBoundingClientRect();

      // Calculate position relative to the canvas
      const position = {
        x: (rect.left - canvasRect.left) / scale,
        y: (rect.top - canvasRect.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      };

      await createHighlight(selectedText, position);
      selection.removeAllRanges();
    } catch (error) {
      console.error("Error handling text selection:", error);
      toast({
        title: "Error creating highlight",
        description: "Failed to process text selection",
        variant: "destructive",
      });
    }
  };

  const createHighlight = async (text: string, position: any) => {
    try {
      const response = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          pdfUuid,
          pageNumber,
          text,
          position,
          color: "#ffeb3b",
          note: "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setHighlights((prev) => [...prev, data.highlight]);
        toast({ title: "Highlight created successfully" });
      } else {
        throw new Error(`Failed to create highlight: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to create highlight:", error);
      toast({ title: "Failed to create highlight", variant: "destructive" });
    }
  };

  const copySelectedText = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const text = selection.toString();
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast({ title: "Text copied to clipboard" });
          // console.log("Copied text:", text);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          toast({ title: "Failed to copy text", variant: "destructive" });
        });
    } else {
      toast({ title: "No text selected" });
    }
  };

  const selectAllText = () => {
    if (textLayerRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(textLayerRef.current);
        selection.addRange(range);
        toast({ title: "All text selected" });
      }
    }
  };

  const deleteHighlight = async (highlightUuid: string) => {
    try {
      const response = await fetch(`/api/highlights/${highlightUuid}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      if (response.ok) {
        setHighlights((prev) => prev.filter((h) => h.uuid !== highlightUuid));
        toast({ title: "Highlight deleted successfully" });
      }
    } catch (error) {
      console.error("Failed to delete highlight:", error);
      toast({ title: "Failed to delete highlight", variant: "destructive" });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = `/api/pdf/${pdfUuid}`;
    link.download = `${title}.pdf`;
    link.click();
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    setPdfDoc(null);
    window.location.reload();
  };

  const currentPageHighlights = highlights.filter(
    (h) => h.pageNumber === pageNumber
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Loading PDF...
          </h3>
          <p className="text-gray-600">
            Please wait while we load your document
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>UUID: {pdfUuid}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 mb-6">
            <svg
              className="h-16 w-16 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Failed to Load PDF</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={retryLoad} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500">
            <div className="text-left space-y-2">
              <p>
                <strong>PDF UUID:</strong> {pdfUuid}
              </p>
              <p>
                <strong>API Endpoint:</strong> /api/pdf/{pdfUuid}
              </p>
              <div className="mt-3">
                <p className="font-medium mb-1">Troubleshooting Steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check if you&apos;re logged in</li>
                  <li>Verify PDF file exists</li>
                  <li>Check browser console for errors</li>
                  <li>Try refreshing the page</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <h1 className="text-lg font-semibold text-gray-900 max-w-md truncate">
          {title}
        </h1>

        <div className="flex items-center space-x-2">
          <Button
            variant={highlightMode ? "default" : "outline"}
            size="sm"
            onClick={() => setHighlightMode(!highlightMode)}
            className="flex items-center space-x-2"
          >
            <Highlighter className="h-4 w-4" />
            <span>Highlight</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={copySelectedText}
            title="Copy Selected Text"
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={selectAllText}
            title="Select All Text (Ctrl+A)"
          >
            Select All
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={rotateDocument}
            title="Rotate 90°"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadPDF}
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-2 border-l pl-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeScale(scale - 0.2)}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-sm text-gray-600 min-w-16 text-center">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => changeScale(scale + 0.2)}
              disabled={scale >= 3.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Input
            type="number"
            value={pageNumber}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= numPages) {
                setPageNumber(page);
              }
            }}
            className="w-16 text-center"
            min={1}
            max={numPages}
          />

          <span className="text-sm text-gray-600">of {numPages}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col items-center overflow-auto p-4">
          <div className="relative shadow-lg" ref={containerRef}>
            <canvas
              ref={canvasRef}
              className="border border-gray-300 max-w-full h-auto"
            />

            {/* Text Layer for selection and copying */}
            <div
              ref={textLayerRef}
              className="absolute top-0 left-0 overflow-hidden text-layer select-text"
              style={{
                mixBlendMode: "multiply",
                pointerEvents: "auto",
                userSelect: "text",
                zIndex: 1,
              }}
              onMouseUp={handleTextSelection}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "a") {
                  e.preventDefault();
                  selectAllText();
                }
              }}
            />

            {/* Render highlights */}
            {currentPageHighlights.map((highlight) => (
              <div
                key={highlight.uuid}
                className="absolute cursor-pointer group border-2 border-opacity-60 hover:border-opacity-100"
                style={{
                  left: `${highlight.position.x * scale}px`,
                  top: `${highlight.position.y * scale}px`,
                  width: `${highlight.position.width * scale}px`,
                  height: `${highlight.position.height * scale}px`,
                  backgroundColor: `${highlight.color}40`,
                  borderColor: highlight.color,
                  zIndex: 2,
                }}
                title={highlight.text}
                onClick={() => setSelectedHighlight(highlight)}
              >
                <div className="absolute -top-8 left-0 hidden group-hover:block bg-black text-white text-xs p-1 rounded max-w-xs z-10">
                  {highlight.text.substring(0, 100)}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Highlights ({highlights.length})
            </h3>

            <div className="space-y-3">
              {highlights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Highlighter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No highlights yet</p>
                  <p className="text-sm">
                    Enable highlight mode and select text
                  </p>
                </div>
              ) : (
                highlights.map((highlight) => (
                  <div
                    key={highlight.uuid}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setPageNumber(highlight.pageNumber)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">
                        Page {highlight.pageNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHighlight(highlight.uuid);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm text-gray-800 line-clamp-3 mb-2">
                      {highlight.text}
                    </p>

                    {highlight.note && (
                      <div className="flex items-start space-x-2 mt-2 p-2 bg-gray-100 rounded">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600">
                          {highlight.note}
                        </p>
                      </div>
                    )}

                    <div
                      className="w-full h-1 rounded mt-2"
                      style={{ backgroundColor: highlight.color }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
