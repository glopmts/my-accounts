"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useState } from "react";
import { MyAccounts } from "../../types/interfaces";

interface SortableContainerProps {
  children: React.ReactNode;
  accounts: MyAccounts[];
  onOrderChange: (accounts: MyAccounts[]) => void;
  onSaveOrder: (accounts: MyAccounts[]) => Promise<void>;
  disabled?: boolean;
}

export const SortableContainer: React.FC<SortableContainerProps> = ({
  children,
  accounts,
  onOrderChange,
  onSaveOrder,
  disabled = false,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return;
    setActiveId(event.active.id as string);
    document.body.classList.add("dragging-active");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    document.body.classList.remove("dragging-active");

    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const oldIndex = accounts.findIndex((item) => item.id === active.id);
    const newIndex = accounts.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      setActiveId(null);
      return;
    }

    const newAccounts = arrayMove(accounts, oldIndex, newIndex);

    const updatedAccounts = newAccounts.map((account, index) => ({
      ...account,
      position: index,
    }));

    onOrderChange(updatedAccounts);

    try {
      setIsSaving(true);
      await onSaveOrder(updatedAccounts);
      console.log(
        "Ordem salva automaticamente:",
        updatedAccounts.map((a) => ({
          id: a.id,
          title: a.title,
          position: a.position,
        })),
      );
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
    } finally {
      setIsSaving(false);
      setActiveId(null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={accounts.map((account) => account.id)}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-xl p-4 shadow-2xl opacity-80 rotate-3 scale-105">
              <div className="text-xs text-zinc-400 mb-2">Arrastando...</div>
              <div className="text-sm font-medium text-zinc-200">
                {accounts.find((a) => a.id === activeId)?.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {isSaving && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm text-zinc-300 px-4 py-2 rounded-lg border border-zinc-800 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Salvando nova ordem...</span>
        </div>
      )}
    </>
  );
};
