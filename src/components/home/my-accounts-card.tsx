"use client";

import { useState } from "react";
import { useMyAccounts } from "../../hooks/use-my-accounts";
import { useAuthCustom } from "../../lib/useAuth";
import { useMyAccountsQuery } from "../../services/query/use-accounts-quey";
import { LayoutGrid, List, ViewMode } from "../../types/constantes";
import { MyAccounts, SecretTypeSelector } from "../../types/interfaces";
import { AccountCard } from "../card-account";
import AddSecretModal from "../modals/auto-form-secret";
import DetailsAccountModel from "../modals/details-account-select";
import { Skeleton } from "../ui/skeleton";

const CardsHomeAccounts = () => {
  const { userId, isLoading } = useAuthCustom();
  const {
    data: accounts,
    isLoading: isAccountsLoading,
    refetch,
  } = useMyAccountsQuery(userId);

  const { deleteAccount } = useMyAccounts({
    refetch,
    userId,
  });

  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [isView, setView] = useState(false);
  const [isViewData, setViewData] = useState<MyAccounts | null>(null);
  const [editingAccount, setEditingAccount] = useState<MyAccounts | null>(null);
  const [selectedType, setSelectedType] = useState<SecretTypeSelector | "ALL">(
    "ALL",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const renderSkeletonCards = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="p-4 border rounded shadow">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading || isAccountsLoading) {
    return <div className="w-full h-full">{renderSkeletonCards()}</div>;
  }

  const handleEdit = (account: MyAccounts) => {
    setEditingAccount(account);
    setIsEditingModalOpen((prev) => !prev);
  };

  const handleView = (account: MyAccounts) => {
    setViewData(account);
    setView((prev) => !prev);
  };

  const handleCloseEditModal = () => {
    setIsEditingModalOpen(false);
    setEditingAccount(null);
  };

  const handleCloseViewModal = () => {
    setView(false);
    setViewData(null);
  };

  const handleSuccess = () => {
    setIsEditingModalOpen(false);
    setEditingAccount(null);
  };

  return (
    <div className="w-full h-full">
      <div className="pb-2 flex justify-between items-center w-full">
        <h2 className="text-2xl font-semibold">Minhas contas</h2>
        {/* Modal para adicionar (não controlado) */}
        <AddSecretModal refetch={refetch} />
      </div>
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === "grid" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <LayoutGrid size={18} /> Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${viewMode === "list" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <List size={18} /> List
            </button>
          </div>
          <div className="text-xs text-zinc-500">
            Showing {accounts?.length} results
          </div>
        </div>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
              : "space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
          }
        >
          {accounts?.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              viewMode={viewMode}
              onDelete={deleteAccount}
              onEdit={handleEdit}
              onView={handleView}
            />
          ))}
        </div>
      </div>

      {/* Modal para edição (controlado) */}
      {editingAccount && (
        <AddSecretModal
          editingAccount={editingAccount}
          isOpen={isEditingModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleSuccess}
          triggerType="custom"
          refetch={refetch}
        />
      )}

      {isView && isViewData && (
        <DetailsAccountModel
          account={isViewData}
          isOpen={isView}
          onClose={handleCloseViewModal}
          handleDelete={deleteAccount}
        />
      )}
    </div>
  );
};

export default CardsHomeAccounts;
