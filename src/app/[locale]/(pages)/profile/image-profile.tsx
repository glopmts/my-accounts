"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/avatar-custom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageProfileProps {
  currentImage?: string;
  userName?: string;
  onImageUpdate: (url: string) => Promise<void>;
  isUploading?: boolean;
}

export function ImageProfile({
  currentImage,
  userName,
  onImageUpdate,
  isUploading = false,
}: ImageProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith("image/")) {
      toast.error(
        "Por favor, selecione uma imagem válida (PNG, JPG, JPEG, GIF)",
      );
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 4MB");
      return;
    }

    setSelectedFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione uma imagem primeiro");
      return;
    }

    try {
      setIsUploadingFile(true);
      setUploadProgress(0);

      // Simula progresso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.details || "Falha no upload",
        );
      }

      const data = await response.json();

      if (data.url) {
        toast.success("Imagem enviada com sucesso!");
        await onImageUpdate(data.url);
        setIsOpen(false);
        setPreview(null);
        setSelectedFile(null);
      }

      // Reseta o estado
      setTimeout(() => {
        setIsUploadingFile(false);
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Erro ao enviar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      );
      setIsUploadingFile(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 4MB");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = async () => {
    try {
      await onImageUpdate("");
      toast.success("Imagem removida com sucesso!");
      setIsOpen(false);
    } catch (error) {
      toast.error("Erro ao remover imagem");
    }
  };

  const isLoading = isUploading || isUploadingFile;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setPreview(null);
            setSelectedFile(null);
            setUploadProgress(0);
          }
        }}
      >
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg transition-transform group-hover:scale-105">
              <AvatarImage
                src={currentImage || ""}
                alt={userName || "User Avatar"}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="w-auto">
          <DialogHeader>
            <DialogTitle>Alterar Foto de Perfil</DialogTitle>
          </DialogHeader>

          {/* Input de arquivo escondido */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />

          <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors w-full">
            <CardContent className="p-6 w-full">
              <div
                className={cn(
                  "flex flex-col items-center w-full justify-center gap-4 min-h-50 rounded-lg cursor-pointer",
                  "transition-colors hover:bg-muted/30",
                  preview && "bg-muted/50",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => {
                  if (!isLoading && !preview) {
                    fileInputRef.current?.click();
                  }
                }}
              >
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full max-h-48 rounded-lg object-cover shadow-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">
                        Clique ou arraste uma imagem
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        PNG, JPG, GIF até 4MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {isUploadingFile && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {uploadProgress}% concluído
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2 justify-end">
              {currentImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  className="mr-auto"
                >
                  Remover imagem atual
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setPreview(null);
                  setSelectedFile(null);
                  setUploadProgress(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>

              {/* Botão para UploadThing */}
              <Button
                onClick={handleUpload}
                disabled={isLoading || !selectedFile}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Usar UploadThing"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="text-sm"
              >
                {selectedFile ? "Selecionar outra imagem" : "Selecionar imagem"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
