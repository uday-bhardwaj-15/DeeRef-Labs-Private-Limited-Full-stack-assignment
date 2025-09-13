// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { Layout } from "@/components/Layout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   Upload,
//   FileText,
//   Calendar,
//   MoreVertical,
//   Edit,
//   Trash2,
//   Eye,
//   Plus,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useRouter } from "next/navigation";
// import { formatDistanceToNow } from "date-fns";

// interface PDF {
//   uuid: string;
//   title: string;
//   filename: string;
//   fileSize: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export default function DashboardPage() {
//   const { user } = useAuth();
//   const [pdfs, setPdfs] = useState<PDF[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [showUploadDialog, setShowUploadDialog] = useState(false);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null);
//   const [title, setTitle] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();
//   const router = useRouter();

//   // useEffect(() => {
//   //   // loadPDFs();
//   // }, []);

//   const loadPDFs = async () => {
//     try {
//       const response = await fetch("/api/pdf/list");
//       if (response.ok) {
//         const data = await response.json();
//         setPdfs(data.pdfs);
//       }
//     } catch (error) {
//       console.error("Failed to load PDFs:", error);
//       toast({
//         title: "Error",
//         description: "Failed to load your PDFs",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       if (selectedFile.type !== "application/pdf") {
//         toast({
//           title: "Invalid file type",
//           description: "Please select a PDF file",
//           variant: "destructive",
//         });
//         return;
//       }
//       setFile(selectedFile);
//       setTitle(selectedFile.name.replace(".pdf", ""));
//     }
//   };

//   const handleUpload = async () => {
//     if (!file || !title.trim()) {
//       toast({
//         title: "Missing information",
//         description: "Please select a file and enter a title",
//         variant: "destructive",
//       });
//       return;
//     }

//     setUploading(true);

//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("title", title.trim());

//       const response = await fetch("/api/pdf/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast({
//           title: "Success",
//           description: "PDF uploaded successfully",
//         });
//         setShowUploadDialog(false);
//         setFile(null);
//         setTitle("");
//         loadPDFs();
//       } else {
//         const error = await response.json();
//         throw new Error(error.error);
//       }
//     } catch (error: any) {
//       toast({
//         title: "Upload failed",
//         description: error.message || "Failed to upload PDF",
//         variant: "destructive",
//       });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleEdit = async () => {
//     if (!selectedPdf || !title.trim()) return;

//     try {
//       const response = await fetch(`/api/pdf/${selectedPdf.uuid}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: title.trim() }),
//       });

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "PDF updated successfully",
//         });
//         setShowEditDialog(false);
//         setSelectedPdf(null);
//         setTitle("");
//         loadPDFs();
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update PDF",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDelete = async (pdf: PDF) => {
//     if (!confirm(`Are you sure you want to delete "${pdf.title}"?`)) return;

//     try {
//       const response = await fetch(`/api/pdf/${pdf.uuid}`, {
//         method: "DELETE",
//       });

//       if (response.ok) {
//         toast({
//           title: "Success",
//           description: "PDF deleted successfully",
//         });
//         loadPDFs();
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete PDF",
//         variant: "destructive",
//       });
//     }
//   };

//   const formatFileSize = (bytes: number) => {
//     if (bytes === 0) return "0 Bytes";
//     const k = 1024;
//     const sizes = ["Bytes", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex items-center justify-center h-64">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Welcome back, {user?.name}
//             </h1>
//             <p className="text-gray-600 mt-2">
//               Manage your PDF documents and annotations
//             </p>
//           </div>

//           <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
//             <DialogTrigger asChild>
//               <Button className="flex items-center space-x-2">
//                 <Plus className="h-4 w-4" />
//                 <span>Upload PDF</span>
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Upload New PDF</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="file">Select PDF File</Label>
//                   <Input
//                     id="file"
//                     type="file"
//                     accept=".pdf"
//                     ref={fileInputRef}
//                     onChange={handleFileSelect}
//                   />
//                 </div>

//                 {file && (
//                   <div className="space-y-2">
//                     <Label htmlFor="title">Document Title</Label>
//                     <Input
//                       id="title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       placeholder="Enter document title"
//                     />
//                   </div>
//                 )}

//                 <div className="flex justify-end space-x-2">
//                   <Button
//                     variant="outline"
//                     onClick={() => {
//                       setShowUploadDialog(false);
//                       setFile(null);
//                       setTitle("");
//                     }}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleUpload}
//                     disabled={!file || !title.trim() || uploading}
//                   >
//                     {uploading ? "Uploading..." : "Upload"}
//                   </Button>
//                 </div>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardContent className="flex items-center p-6">
//               <FileText className="h-8 w-8 text-blue-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {pdfs.length}
//                 </p>
//                 <p className="text-gray-600">Total Documents</p>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="flex items-center p-6">
//               <Upload className="h-8 w-8 text-green-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {formatFileSize(
//                     pdfs.reduce((acc, pdf) => acc + pdf.fileSize, 0)
//                   )}
//                 </p>
//                 <p className="text-gray-600">Storage Used</p>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="flex items-center p-6">
//               <Calendar className="h-8 w-8 text-purple-600" />
//               <div className="ml-4">
//                 <p className="text-2xl font-bold text-gray-900">
//                   {pdfs.length > 0
//                     ? formatDistanceToNow(new Date(pdfs[0].createdAt), {
//                         addSuffix: true,
//                       })
//                     : "N/A"}
//                 </p>
//                 <p className="text-gray-600">Last Upload</p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* PDF Grid */}
//         {pdfs.length === 0 ? (
//           <div className="text-center py-12">
//             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               No documents yet
//             </h3>
//             <p className="text-gray-600 mb-4">
//               Upload your first PDF to get started with annotations
//             </p>
//             <Button onClick={() => setShowUploadDialog(true)}>
//               Upload PDF
//             </Button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {pdfs.map((pdf) => (
//               <Card
//                 key={pdf.uuid}
//                 className="hover:shadow-lg transition-shadow"
//               >
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between mb-4">
//                     <FileText className="h-8 w-8 text-red-600" />
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm">
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem
//                           onClick={() => router.push(`/viewer/${pdf.uuid}`)}
//                         >
//                           <Eye className="h-4 w-4 mr-2" />
//                           Open
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => {
//                             setSelectedPdf(pdf);
//                             setTitle(pdf.title);
//                             setShowEditDialog(true);
//                           }}
//                         >
//                           <Edit className="h-4 w-4 mr-2" />
//                           Rename
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => handleDelete(pdf)}
//                           className="text-red-600"
//                         >
//                           <Trash2 className="h-4 w-4 mr-2" />
//                           Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>

//                   <div className="space-y-2">
//                     <h3
//                       className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
//                       onClick={() => router.push(`/viewer/${pdf.uuid}`)}
//                     >
//                       {pdf.title}
//                     </h3>

//                     <div className="text-sm text-gray-600 space-y-1">
//                       <p>{formatFileSize(pdf.fileSize)}</p>
//                       <p>
//                         {formatDistanceToNow(new Date(pdf.createdAt), {
//                           addSuffix: true,
//                         })}
//                       </p>
//                     </div>
//                   </div>

//                   <Button
//                     className="w-full mt-4"
//                     onClick={() => router.push(`/viewer/${pdf.uuid}`)}
//                   >
//                     Open Document
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Edit Dialog */}
//         <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Rename Document</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="editTitle">Document Title</Label>
//                 <Input
//                   id="editTitle"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="Enter document title"
//                 />
//               </div>

//               <div className="flex justify-end space-x-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     setShowEditDialog(false);
//                     setSelectedPdf(null);
//                     setTitle("");
//                   }}
//                 >
//                   Cancel
//                 </Button>
//                 <Button onClick={handleEdit} disabled={!title.trim()}>
//                   Save
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </Layout>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileText,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface PDF {
  uuid: string;
  title: string;
  filename: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<PDF | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "Dashboard useEffect - authLoading:",
      authLoading,
      "user:",
      user
    );

    // Only proceed if auth loading is complete
    if (authLoading) return;

    if (!user) {
      console.log("No user found, redirecting to login");
      router.push("/login");
      return;
    }

    // User is authenticated, load PDFs
    console.log("User authenticated, loading PDFs");
    loadPDFs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const loadPDFs = async () => {
    setLoading(true);
    try {
      console.log("Loading PDFs...");
      const response = await fetch("/api/pdf/list", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      console.log("PDF list response:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("PDFs loaded:", data);
        setPdfs(data.pdfs || []);
      } else if (response.status === 401) {
        console.log("Unauthorized, redirecting to login");
        router.push("/login");
        return;
      } else {
        console.error("Failed to load PDFs:", response.status);
        throw new Error("Failed to load PDFs");
      }
    } catch (error) {
      console.error("Failed to load PDFs:", error);
      toast({
        title: "Error",
        description: "Failed to load your PDFs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(".pdf", ""));
    }
  };
  // Updated handleUpload function for dashboard component
  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    // File validation
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit for Vercel
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      console.log("Starting file upload...", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      // Always use Base64 approach for better Vercel compatibility
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:application/pdf;base64, prefix
          const base64Data = result.split(",")[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log("File converted to base64, uploading...");

      const response = await fetch("/api/pdf/upload", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: base64,
          title: title.trim(),
          fileName: file.name,
          fileSize: file.size,
        }),
      });

      console.log("Upload response status:", response.status);

      const responseData = await response.json();
      console.log("Upload response data:", responseData);

      if (response.ok) {
        toast({
          title: "Success",
          description: "PDF uploaded successfully",
        });
        setShowUploadDialog(false);
        setFile(null);
        setTitle("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await loadPDFs();
      } else {
        throw new Error(
          responseData.error || `Upload failed with status ${response.status}`
        );
      }
    } catch (error: any) {
      console.error("Upload error:", error);

      let errorMessage = "Failed to upload PDF";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Provide more specific error messages
      if (errorMessage.includes("413")) {
        errorMessage = "File is too large. Please select a smaller PDF file.";
      } else if (errorMessage.includes("400")) {
        errorMessage =
          "Invalid file format. Please ensure you're uploading a valid PDF file.";
      } else if (errorMessage.includes("401")) {
        errorMessage = "Session expired. Please log in again.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  // const handleUpload = async () => {
  //   if (!file || !title.trim()) {
  //     toast({
  //       title: "Missing information",
  //       description: "Please select a file and enter a title",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setUploading(true);

  //   try {
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("title", title.trim());

  //     const response = await fetch("/api/pdf/upload", {
  //       method: "POST",
  //       credentials: "include",
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       toast({
  //         title: "Success",
  //         description: "PDF uploaded successfully",
  //       });
  //       setShowUploadDialog(false);
  //       setFile(null);
  //       setTitle("");
  //       loadPDFs();
  //     } else {
  //       const error = await response.json();
  //       throw new Error(error.error);
  //     }
  //   } catch (error: any) {
  //     toast({
  //       title: "Upload failed",
  //       description: error.message || "Failed to upload PDF",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  // Replace your handleUpload function with this improved version that tries both methods
  // const handleUpload = async () => {
  //   if (!file || !title.trim()) {
  //     toast({
  //       title: "Missing information",
  //       description: "Please select a file and enter a title",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Additional file validation
  //   if (file.size > 5 * 1024 * 1024) {
  //     // 5MB limit
  //     toast({
  //       title: "File too large",
  //       description: "Please select a file smaller than 5MB",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setUploading(true);

  //   try {
  //     // Try FormData approach first
  //     const formData = new FormData();
  //     formData.append("file", file);
  //     formData.append("title", title.trim());

  //     console.log("Trying FormData upload...");

  //     let response = await fetch("/api/pdf/upload", {
  //       method: "POST",
  //       credentials: "include",
  //       body: formData,
  //     });

  //     // If FormData fails, try Base64 approach
  //     if (!response.ok && response.status === 400) {
  //       console.log("FormData failed, trying Base64 approach...");

  //       // Convert file to base64
  //       const base64 = await new Promise<string>((resolve) => {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           const result = reader.result as string;
  //           resolve(result.split(",")[1]); // Remove data:application/pdf;base64, prefix
  //         };
  //         reader.readAsDataURL(file);
  //       });

  //       response = await fetch("/api/pdf/upload", {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           file: base64,
  //           title: title.trim(),
  //           fileName: file.name,
  //           fileSize: file.size,
  //         }),
  //       });
  //     }

  //     console.log("Upload response status:", response.status);

  //     const responseData = await response.json();
  //     console.log("Upload response data:", responseData);

  //     if (response.ok) {
  //       toast({
  //         title: "Success",
  //         description: "PDF uploaded successfully",
  //       });
  //       setShowUploadDialog(false);
  //       setFile(null);
  //       setTitle("");
  //       if (fileInputRef.current) {
  //         fileInputRef.current.value = "";
  //       }
  //       await loadPDFs();
  //     } else {
  //       throw new Error(
  //         responseData.error || `Upload failed with status ${response.status}`
  //       );
  //     }
  //   } catch (error: any) {
  //     console.error("Upload error:", error);
  //     toast({
  //       title: "Upload failed",
  //       description: error.message || "Failed to upload PDF",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setUploading(false);
  //   }
  // };
  const handleEdit = async () => {
    if (!selectedPdf || !title.trim()) return;

    try {
      const response = await fetch(`/api/pdf/${selectedPdf.uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: title.trim() }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "PDF updated successfully",
        });
        setShowEditDialog(false);
        setSelectedPdf(null);
        setTitle("");
        loadPDFs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update PDF",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pdf: PDF) => {
    if (!confirm(`Are you sure you want to delete "${pdf.title}"?`)) return;

    try {
      const response = await fetch(`/api/pdf/${pdf.uuid}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "PDF deleted successfully",
        });
        loadPDFs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete PDF",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your PDF documents and annotations
            </p>
          </div>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Upload PDF</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload New PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select PDF File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>

                {file && (
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter document title"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadDialog(false);
                      setFile(null);
                      setTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={!file || !title.trim() || uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="flex items-center p-6">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {pdfs.length}
                </p>
                <p className="text-gray-600">Total Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Upload className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(
                    pdfs.reduce((acc, pdf) => acc + pdf.fileSize, 0)
                  )}
                </p>
                <p className="text-gray-600">Storage Used</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {pdfs.length > 0
                    ? formatDistanceToNow(new Date(pdfs[0].createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </p>
                <p className="text-gray-600">Last Upload</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading state for PDFs */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* PDF Grid */}
            {pdfs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No documents yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your first PDF to get started with annotations
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  Upload PDF
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pdfs.map((pdf) => (
                  <Card
                    key={pdf.uuid}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <FileText className="h-8 w-8 text-red-600" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/viewer/${pdf.uuid}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPdf(pdf);
                                setTitle(pdf.title);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(pdf)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-2">
                        <h3
                          className="font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600"
                          onClick={() => router.push(`/viewer/${pdf.uuid}`)}
                        >
                          {pdf.title}
                        </h3>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formatFileSize(pdf.fileSize)}</p>
                          <p>
                            {formatDistanceToNow(new Date(pdf.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={() => router.push(`/viewer/${pdf.uuid}`)}
                      >
                        Open Document
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Document Title</Label>
                <Input
                  id="editTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedPdf(null);
                    setTitle("");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={!title.trim()}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
