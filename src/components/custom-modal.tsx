"use client";

import { X } from "lucide-react";
import React, { useEffect } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  maxWidth?: string;
  className?: string;
  hideOverlay?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  showCloseButton = true,
  closeOnOverlayClick = true,
  maxWidth = "max-w-lg",
  className = "",
  hideOverlay = false,
}) => {
  // Fecha modal com ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      {!hideOverlay && (
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={closeOnOverlayClick ? onClose : undefined}
        />
      )}

      {/* Modal Container */}
      <div
        className={`
          relative w-full ${maxWidth} 
          bg-zinc-900 border border-zinc-800 
          rounded-2xl shadow-2xl 
          animate-in zoom-in-95 duration-200 
          max-h-[90vh] overflow-y-auto
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-zinc-400 mt-1">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
