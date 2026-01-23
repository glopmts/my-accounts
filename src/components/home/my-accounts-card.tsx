"use client";

import { useState } from "react";
import { useMyAccounts } from "../../hooks/use-my-accounts";
import { useAuthCustom } from "../../lib/useAuth";
import { useMyAccountsQuery } from "../../services/query/use-accounts-quey";
import { MyAccounts } from "../../types/interfaces";
import AccountItem from "../cards";
import AddSecretModal from "../modals/auto-form-secret";
import { Skeleton } from "../ui/skeleton";

const CardsHomeAccounts = () => {
  const { userId, isLoading } = useAuthCustom();
  const { data: accounts, isLoading: isAccountsLoading } =
    useMyAccountsQuery(userId);
  const { deleteAccount } = useMyAccounts();
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<MyAccounts | null>(null);

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
    setIsEditingModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditingModalOpen(false);
    setEditingAccount(null);
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
        <AddSecretModal />
      </div>
      <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {accounts?.map((account) => (
            <AccountItem
              myaccounts={account}
              key={account.id}
              onDelete={deleteAccount}
              onEdit={handleEdit}
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
        />
      )}
    </div>
  );
};

export default CardsHomeAccounts;
