"use client";

import jsPDF from "jspdf";
import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface FormData {
  text: string;
  format: "pdf" | "txt";
  pdfFontSize: number;
  pdfPageSize: "a4" | "letter";
  pdfMargins: { top: number; left: number; bottom: number; right: number };
}

interface DownloadButtonProps {
  accountText?: string;
  fileName?: string;
}

const defaultFormData: FormData = {
  text: "",
  format: "pdf",
  pdfFontSize: 12,
  pdfPageSize: "a4",
  pdfMargins: { top: 20, left: 20, bottom: 20, right: 20 },
};

const DownloadButton: React.FC<DownloadButtonProps> = ({
  accountText = "",
  fileName = "output",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("download");

  const triggerBrowserDownload = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (format: "pdf" | "txt") => {
    const text = accountText.trim();

    if (!text) {
      setError(t("infor"));
      toast.error(t("infor"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (format === "txt") {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        triggerBrowserDownload(blob, `${fileName}.txt`);
      } else {
        // PDF generation
        const formData: FormData = {
          ...defaultFormData,
          text,
          format: "pdf",
        };

        const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: formData.pdfPageSize,
        });

        const { top, left, bottom } = formData.pdfMargins;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth =
          pageWidth - formData.pdfMargins.left - formData.pdfMargins.right;

        doc.setFontSize(formData.pdfFontSize);
        doc.setFont("helvetica", "normal");

        const lineHeightMm = formData.pdfFontSize / 2.834645669 + 2;
        const lines = doc.splitTextToSize(text, contentWidth);

        let y = top;
        lines.forEach((line: string) => {
          if (y + lineHeightMm > pageHeight - bottom) {
            doc.addPage();
            y = top;
          }
          doc.text(line, left, y);
          y += lineHeightMm;
        });

        const blob = doc.output("blob");
        triggerBrowserDownload(blob, `${fileName}.pdf`);
      }
    } catch (err) {
      setError(t("error"));
      toast.error(t("error"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {error && (
        <p className="absolute -top-8 right-0 text-xs text-red-500 whitespace-nowrap">
          {error}
        </p>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isLoading}
          >
            <Download size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDownload("txt");
            }}
            disabled={isLoading}
          >
            {t("txt")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDownload("pdf");
            }}
            disabled={isLoading}
          >
            {t("pdf")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DownloadButton;
