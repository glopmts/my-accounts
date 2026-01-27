"use client";

import { useMyAccounts } from "@/hooks/use-my-accounts";
import { useAuthCustom } from "@/lib/useAuth";
import { useMyAccountsQuery } from "@/services/query/use-accounts-quey";
import { LayoutGrid, List, ViewMode } from "@/types/constantes";
import { MyAccounts } from "@/types/interfaces";
import { useCallback, useMemo, useState } from "react";
import { AccountCard } from "../card-account";
import AddSecretModal from "../modals/auto-form-secret";
import DetailsAccountModel from "../modals/details-account-select";
import { SortableContainer } from "../sortable/SortableContainer";
import { SortableItem } from "../sortable/SortableItem";
import { Skeleton } from "../ui/skeleton";

const CardsHomeContent = () => {
  const { userId } = useAuthCustom();
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    refetch,
  } = useMyAccountsQuery(userId);

  const { deleteAccount, handleSaveOrder } = useMyAccounts({
    refetch,
    userId,
  });

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isView, setView] = useState(false);
  const [isViewData, setViewData] = useState<MyAccounts | null>(null);
  const [editingAccount, setEditingAccount] = useState<MyAccounts | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const sortedAccounts = useMemo(() => {
    if (!accounts) return [];

    // Ordena apenas pela posição
    return [...accounts].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [accounts]);

  const handleOrderChange = useCallback((newAccounts: MyAccounts[]) => {
    const currentIsDragging =
      document.body.classList.contains("dragging-active");
    if (!currentIsDragging) {
      return;
    }
    return;
  }, []);

  // Handlers
  const handleEdit = useCallback((account: MyAccounts) => {
    setEditingAccount(account);
    setIsEditingModalOpen(true);
  }, []);

  const handleView = useCallback((account: MyAccounts) => {
    setViewData(account);
    setView(true);
  }, []);

  if (isAccountsLoading) {
    return (
      <div className="w-full h-full p-4">
        <div className="pb-2 flex justify-between items-center w-full mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6 animate-in fade-in duration-500 md:p-3">
      {/* Header */}
      <div className="flex  w-full flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-semibold dark:text-zinc-100">
            Minhas contas
          </h2>
          <p className="text-sm dark:text-zinc-500 mt-1">
            Arraste para reordenar • Salva automaticamente
          </p>
        </div>
        <div className="flex items-center gap-3 w-auto">
          <div className="text-xs dark:text-zinc-400 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border dark:border-zinc-800">
            {sortedAccounts.length} item
            {sortedAccounts.length !== 1 ? "s" : ""}
          </div>
          <AddSecretModal refetch={refetch} />
        </div>
      </div>

      {/* View Mode Toggle e Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b dark:border-zinc-900">
          <div className="flex items-center gap-2 p-1 dark:bg-zinc-900/50 rounded-lg border dark:border-zinc-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "dark:bg-zinc-800 dark:text-zinc-100 shadow-sm bg-zinc-300"
                  : "dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <LayoutGrid size={16} />
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex  cursor-pointer items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "list"
                  ? "dark:bg-zinc-800 dark:text-zinc-100 shadow-sm bg-zinc-400"
                  : "dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              <List size={16} />
              List
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs dark:text-zinc-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500/50 animate-pulse"></div>
              <span>Arraste os cards para reordenar</span>
            </div>
          </div>
        </div>

        {/* Accounts Grid/List - Use sortedAccounts diretamente */}
        <SortableContainer
          accounts={sortedAccounts}
          onOrderChange={handleOrderChange}
          onSaveOrder={handleSaveOrder}
        >
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedAccounts.map((account) => (
              <SortableItem key={account.id} id={account.id} isSorting={true}>
                <AccountCard
                  account={account}
                  userId={userId}
                  viewMode={viewMode}
                  onDelete={deleteAccount}
                  onEdit={handleEdit}
                  onView={handleView}
                  refetch={refetch}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContainer>
      </div>

      {/* Modals */}
      {editingAccount && (
        <AddSecretModal
          editingAccount={editingAccount}
          isOpen={isEditingModalOpen}
          onClose={() => {
            setIsEditingModalOpen(false);
            setEditingAccount(null);
            refetch();
          }}
          onSuccess={() => {
            setIsEditingModalOpen(false);
            setEditingAccount(null);
            refetch();
          }}
          triggerType="custom"
          refetch={refetch}
        />
      )}

      {isView && isViewData && (
        <DetailsAccountModel
          account={isViewData}
          isOpen={isView}
          onClose={() => {
            setView(false);
            setViewData(null);
          }}
          handleDelete={deleteAccount}
        />
      )}
    </div>
  );
};

// Componente principal
const CardsHomeAccounts = () => {
  const { userId, isLoading } = useAuthCustom();

  if (isLoading) {
    return (
      <div className="w-full h-full p-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="dark:bg-zinc-900/50 border dark:border-zinc-800 rounded-xl p-5"
            >
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <CardsHomeContent />;
};

export default CardsHomeAccounts;
