"use client";

import { AccountCard } from "@/components/card-account";
import CustomModal from "@/components/custom-modal";
import AddSecretModal from "@/components/modals/auto-form-secret";
import DetailsAccountModel from "@/components/modals/details-account-select";
import ProseAccountNotes from "@/components/prose-account-notes";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useMyAccounts } from "@/hooks/use-my-accounts";
import { useAuthCustom } from "@/lib/useAuth";
import { useArchivedQuery } from "@/services/query/use-archived-query";
import { LayoutGrid, List, ViewMode } from "@/types/constantes";
import { ArchivedProps, MyAccounts } from "@/types/interfaces";
import { useCallback, useMemo, useState } from "react";

interface ArchivedWithAccount extends ArchivedProps {
  accountData: MyAccounts;
}

const Archived = () => {
  const { isLoading, userId } = useAuthCustom();

  const {
    data: archiveds,
    isLoading: loader,
    error,
    refetch,
  } = useArchivedQuery(userId);

  const { deleteAccount, handleSaveOrder } = useMyAccounts({
    refetch,
    userId,
  });

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isView, setView] = useState(false);
  const [isViewData, setViewData] = useState<MyAccounts | null>(null);
  const [editingAccount, setEditingAccount] = useState<MyAccounts | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");

  const transformedAccounts = useMemo(() => {
    if (!archiveds || archiveds.length === 0) return [];

    return archiveds.map((archived) => ({
      ...archived,
      accountData: archived.myaccount,
    })) as unknown as ArchivedWithAccount[];
  }, [archiveds]);

  const sortedAccounts = useMemo(() => {
    if (transformedAccounts.length === 0) return [];

    return [...transformedAccounts].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [transformedAccounts]);

  const handleEdit = useCallback((archivedItem: ArchivedWithAccount) => {
    setEditingAccount(archivedItem.accountData);
    setIsEditingModalOpen(true);
  }, []);

  const handleView = useCallback((archivedItem: ArchivedWithAccount) => {
    setViewData(archivedItem.accountData);
    setSelectedNotes(archivedItem.accountData.notes || "");
    setView(true);
  }, []);

  const handleExpandNotes = useCallback(() => {
    setIsExpanded(true);
    setView(false);
  }, []);

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      await deleteAccount(accountId);
      refetch();
    },
    [deleteAccount, refetch],
  );

  if (isLoading || loader) {
    return (
      <div className="w-full h-full flex items-center max-w-7xl justify-center min-h-screen mx-auto">
        <Spinner className="size-7" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">Erro ao carregar itens arquivados</p>
          <Button onClick={() => refetch()} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-7xl mx-auto p-2">
      <div className="pb-3">
        <h1 className="text-2xl font-semibold">Items Arquivados</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {sortedAccounts.length} item{sortedAccounts.length !== 1 ? "s" : ""}{" "}
          arquivado{sortedAccounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="w-full h-full">
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
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
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

          {sortedAccounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-zinc-400">
                Nenhum item arquivado encontrado
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {sortedAccounts.map((archivedItem) => (
                <AccountCard
                  key={archivedItem.id}
                  account={archivedItem.accountData}
                  viewMode={viewMode}
                  userId={userId}
                  onDelete={handleDeleteAccount}
                  onEdit={() => handleEdit(archivedItem)}
                  onView={() => handleView(archivedItem)}
                  refetch={refetch}
                  isArchived={true}
                />
              ))}
            </div>
          )}
        </div>
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
          handleDelete={() => {
            // Encontrar o archivedId correspondente
            const archivedItem = sortedAccounts.find(
              (item) => item.accountData.id === isViewData.id,
            );
            if (archivedItem) {
              handleDeleteAccount(archivedItem.id);
            }
            setView(false);
            setViewData(null);
          }}
          isExpanded={isExpanded}
          notes={selectedNotes}
          setIsExpanded={handleExpandNotes}
          setNotes={setSelectedNotes}
        />
      )}

      {isExpanded && (
        <CustomModal
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          title="Contéudo da conta"
          maxWidth="max-w-4xl"
          className="z-999"
        >
          <ProseAccountNotes
            notes={selectedNotes}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </CustomModal>
      )}
    </div>
  );
};

const ArchivedPage = () => {
  const { isLoading } = useAuthCustom();

  if (isLoading) {
    return (
      <div className="w-full h-full p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-32 mb-8" />
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

  return <Archived />;
};

export default ArchivedPage;
