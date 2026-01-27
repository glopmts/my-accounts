"use client";

import { useArchivedQuery } from "@/services/query/use-archived-query";
import { Archive, ArchiveX } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type PropsButton = {
  myaccountId: string;
  userId: string;
  onArchiveChange?: (isArchived: boolean) => void;
  refetch: () => void;
};

const ArchivedButton: FC<PropsButton> = ({
  myaccountId,
  userId,
  refetch,
  onArchiveChange,
}) => {
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { refetch: refetchArchived } = useArchivedQuery(userId);

  useEffect(() => {
    fetchArchiveStatus();
  }, [myaccountId]);

  const fetchArchiveStatus = async () => {
    try {
      const response = await fetch(
        `/api/archived/check?myaccountId=${myaccountId}`,
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar status");
      }

      const data = await response.json();

      if (data.success) {
        setIsArchived(data.data.isArchived);
      }
    } catch (error) {
      console.error("Erro ao buscar status de arquivamento:", error);
      toast.error("Erro ao carregar status");
    }
  };

  const handleArchiveToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/archived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ myaccountId }),
      });

      const data = await response.json();

      if (data.success) {
        const newArchiveStatus = data.data.isArchived;
        setIsArchived(newArchiveStatus);

        if (onArchiveChange) {
          onArchiveChange(newArchiveStatus);
        }

        toast.success(data.message);
        refetch();
        refetchArchived();
      } else {
        throw new Error(data.message || "Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao arquivar/desarquivar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={handleArchiveToggle}
        disabled={isLoading}
        variant={isArchived ? "destructive" : "outline"}
        size="sm"
        className="gap-2 transition-all duration-200 hover:scale-105"
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : isArchived ? (
          <>
            <ArchiveX size={16} className="mr-1" />
          </>
        ) : (
          <>
            <Archive size={16} className="mr-1" />
          </>
        )}
      </Button>

      {/* Tooltip opcional */}
      {isArchived && (
        <span className="ml-2 text-xs text-muted-foreground">
          Esta conta está arquivada
        </span>
      )}
    </div>
  );
};

export default ArchivedButton;
