"use client";

import { debounce } from "lodash";
import { ArrowUpDown, Check, Layers, LayoutGrid, Type, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { MyAccounts } from "../../types/interfaces";
import { useSortable } from "./SortableContext";

interface CategoryManagerProps {
  accounts: MyAccounts[];
  onCategoryUpdate: (updatedAccounts: MyAccounts[]) => void;
  onOrderChange?: (updatedAccounts: MyAccounts[]) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  accounts,
  onCategoryUpdate,
  onOrderChange,
}) => {
  const { isSorting, setIsSorting, categories, updateAccountOrder } =
    useSortable();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Debounce para salvar automaticamente após arrastar
  const debouncedSaveOrder = useCallback(
    debounce(async (accountsToSave: MyAccounts[]) => {
      try {
        setIsSaving(true);
        setSaveStatus("saving");

        const accountsWithCategory = accountsToSave.map((account, index) => ({
          ...account,
          position: index,
          orderInCategory: index,
          category: account.category || "default",
        }));

        await updateAccountOrder(accountsWithCategory);

        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000); // Remove status após 2 segundos

        if (onOrderChange) {
          onOrderChange(accountsWithCategory);
        }
      } catch (error) {
        console.error("Error saving order:", error);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } finally {
        setIsSaving(false);
      }
    }, 500), // 500ms de debounce
    [updateAccountOrder, onOrderChange],
  );

  const handleToggleSorting = () => {
    setIsSorting(!isSorting);
  };

  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("saving");

      const accountsWithCategory = accounts.map((account, index) => ({
        ...account,
        position: index,
        orderInCategory: index,
        category: account.category || "default",
      }));

      await updateAccountOrder(accountsWithCategory);
      onCategoryUpdate(accountsWithCategory);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);

      setIsSorting(false);
    } catch (error) {
      console.error("Error saving order:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = async (
    accountId: string,
    newCategory: string,
  ) => {
    try {
      setIsSaving(true);

      const response = await fetch(`/api/accounts/category/${accountId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: newCategory,
          orderInCategory: 0,
        }),
      });

      if (response.ok) {
        const updatedAccount = await response.json();
        const updatedAccounts = accounts.map((account) =>
          account.id === accountId ? updatedAccount : account,
        );
        onCategoryUpdate(updatedAccounts);

        // Salva automaticamente a nova ordem
        debouncedSaveOrder(updatedAccounts);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Função para salvar quando um item é arrastado para nova posição
  const handleDragEnd = (draggedAccounts: MyAccounts[]) => {
    // Atualiza a ordem baseada no novo array
    const updatedAccounts = draggedAccounts.map((account, index) => ({
      ...account,
      position: index,
      orderInCategory: index,
    }));

    // Salva automaticamente
    debouncedSaveOrder(updatedAccounts);
  };

  // Limpa o debounce ao desmontar
  useEffect(() => {
    return () => {
      debouncedSaveOrder.cancel();
    };
  }, [debouncedSaveOrder]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "top":
        return <Type size={16} />;
      case "middle":
        return <Layers size={16} />;
      case "bottom":
        return <LayoutGrid size={16} />;
      case "center":
        return <Type size={16} />;
      default:
        return <LayoutGrid size={16} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "top":
        return "Topo";
      case "middle":
        return "Meio";
      case "bottom":
        return "Baixo";
      case "center":
        return "Centro";
      case "default":
        return "Padrão";
      default:
        return category;
    }
  };

  const getStatusMessage = () => {
    switch (saveStatus) {
      case "saving":
        return "Salvando...";
      case "saved":
        return "Salvo!";
      case "error":
        return "Erro ao salvar";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (saveStatus) {
      case "saving":
        return "text-yellow-500";
      case "saved":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleSorting}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isSorting
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <ArrowUpDown size={16} />
            {isSorting ? "Modo Ordenação Ativo" : "Ordenar Itens"}
          </button>

          {isSorting && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? "bg-green-700 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                <Check size={16} />
                {isSaving ? "Salvando..." : "Salvar Ordem"}
              </button>
              <button
                onClick={() => setIsSorting(false)}
                disabled={isSaving}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? "bg-zinc-800 cursor-not-allowed"
                    : "bg-zinc-700 hover:bg-zinc-600"
                } text-zinc-300`}
              >
                <X size={16} />
                Cancelar
              </button>

              {/* Status de salvamento */}
              {saveStatus !== "idle" && (
                <div className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusMessage()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isSaving && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-zinc-400">Salvando...</span>
            </div>
          )}

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isSaving}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="all">Todas Categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSorting && (
        <div className="grid grid-cols-5 gap-2 p-4 bg-zinc-900/30 rounded-lg">
          {categories.map((category) => {
            const itemsInCategory = accounts.filter(
              (a) => a.category === category,
            );
            const itemCount = itemsInCategory.length;

            return (
              <div
                key={category}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  itemCount > 0
                    ? "bg-zinc-800/50 border-zinc-700"
                    : "bg-zinc-900/20 border-zinc-800/50"
                }`}
              >
                <div className="mb-2 text-zinc-400">
                  {getCategoryIcon(category)}
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  {getCategoryLabel(category)}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-zinc-500">
                    {itemCount} itens
                  </span>
                  {itemCount > 0 && (
                    <span className="text-xs text-blue-500">
                      • Arraste aqui
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isSorting && (
        <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-zinc-400">
              Categorias dos Itens:
            </h4>
            <div className="text-xs text-zinc-500">
              Arraste os itens para reordenar • Clique em Salvar ou arraste para
              salvar automaticamente
            </div>
          </div>

          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center">
                    {account.icon ? (
                      <img
                        src={account.icon}
                        alt=""
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <Type size={14} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-300">
                      {account.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {getCategoryLabel(account.category || "default")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      account.category === "top"
                        ? "bg-blue-900/30 text-blue-400"
                        : account.category === "middle"
                          ? "bg-purple-900/30 text-purple-400"
                          : account.category === "bottom"
                            ? "bg-amber-900/30 text-amber-400"
                            : account.category === "center"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    Posição: {account.orderInCategory || 0}
                  </div>

                  <select
                    value={account.category || "default"}
                    onChange={(e) =>
                      handleCategoryChange(account.id, e.target.value)
                    }
                    disabled={isSaving}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {getCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota sobre salvamento automático */}
      {isSorting && (
        <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Salvamento automático ativo</span>
          </div>
          <p className="text-xs text-blue-300/80 mt-1">
            As alterações de ordem e categoria são salvas automaticamente quando
            você arrasta os itens. Você também pode clicar em &quot;Salvar
            Ordem&quot; para salvar manualmente.
          </p>
        </div>
      )}
    </div>
  );
};
