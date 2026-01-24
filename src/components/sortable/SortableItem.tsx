"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isSorting: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  children,
  isSorting,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isHovered, setIsHovered] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  // Adiciona efeito de hover
  useEffect(() => {
    if (isSorting) {
      const element = document.getElementById(`sortable-item-${id}`);
      if (element) {
        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => setIsHovered(false);

        element.addEventListener("mouseenter", handleMouseEnter);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mouseenter", handleMouseEnter);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    }
  }, [id, isSorting]);

  if (!isSorting) {
    return <>{children}</>;
  }

  return (
    <div
      id={`sortable-item-${id}`}
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ${
        isDragging ? "z-50 scale-105" : "z-0"
      } ${isHovered && !isDragging ? "scale-[1.02]" : ""}`}
    >
      <div className="absolute -left-8 top-1/2 -translate-y-1/2">
        <button
          className={`p-2 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isHovered || isDragging
              ? "text-zinc-300 bg-zinc-800/50"
              : "text-zinc-600 hover:text-zinc-400"
          }`}
          {...attributes}
          {...listeners}
          title="Arraste para reordenar"
        >
          <GripVertical size={18} />
        </button>
      </div>

      {/* Efeito visual durante drag */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-blue-500/50 rounded-xl bg-blue-500/5"></div>
      )}

      <div className={isDragging ? "opacity-100" : ""}>{children}</div>
    </div>
  );
};
