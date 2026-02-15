import { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";

export type FileWithPath = File & {
  path?: string;
  lastModified?: number;
  webkitRelativePath?: string;
};

export const useUploadThing = (
  endpoint: keyof OurFileRouter,
  config?: {
    onClientUploadComplete?: (res: { url: string; name: string }[]) => void;
    onUploadError?: (error: Error) => void;
    onUploadBegin?: (fileName: string) => void;
  },
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startUpload = async (files: FileWithPath[]) => {
    setIsUploading(true);
    setProgress(0);

    try {
      config?.onUploadBegin?.(files[0].name);

      // Simula progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/uploadthing", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data) && data[0]?.url) {
        config?.onClientUploadComplete?.(
          data.map((file: { url: string; name: string }) => ({
            url: file.url,
            name: file.name,
          })),
        );
      }

      // Reseta após 1 segundo
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);

      return data;
    } catch (error) {
      console.error("Upload error:", error);
      config?.onUploadError?.(
        error instanceof Error ? error : new Error("Upload failed"),
      );
      setIsUploading(false);
      setProgress(0);
      throw error;
    }
  };

  return {
    startUpload,
    isUploading,
    progress,
  };
};
