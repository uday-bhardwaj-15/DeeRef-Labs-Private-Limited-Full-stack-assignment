"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";
import { PDFViewer } from "@/components/PDFViewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PDF {
  uuid: string;
  title: string;
  filename: string;
  fileSize: number;
  createdAt: string;
}

export default function ViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [pdf, setPdf] = useState<PDF | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const uuid = params.uuid as string;

  useEffect(() => {
    loadPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const loadPDF = async () => {
    try {
      const response = await fetch("/api/pdf/list");
      if (response.ok) {
        const data = await response.json();
        const foundPdf = data.pdfs.find((p: PDF) => p.uuid === uuid);

        if (foundPdf) {
          setPdf(foundPdf);
        } else {
          toast({
            title: "Error",
            description: "PDF not found",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Failed to load PDF:", error);
      toast({
        title: "Error",
        description: "Failed to load PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout showNav={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!pdf) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              PDF not found
            </h2>
            <Button onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>

      <PDFViewer pdfUuid={uuid} title={pdf.title} />
    </Layout>
  );
}
