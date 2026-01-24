import { SecretType } from "@/app/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MyAccounts } from "@/types/interfaces";
import { FileCode, Key, Plus, Shield, StickyNote, X } from "lucide-react";
import React from "react";
import { useFormAccount } from "../../hooks/use-form-account";
import CustomModal from "../custom-modal";
import EditorContent from "../md-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface AddSecretModalProps {
  editingAccount?: MyAccounts | null;
  onSuccess?: () => void;
  triggerType?: "button" | "icon" | "text" | "custom";
  triggerClassName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  refetch?: () => void;
  trigger?: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

const AddSecretModal: React.FC<AddSecretModalProps> = ({
  editingAccount,
  onSuccess,
  isOpen: isOpenProp,
  onClose: onCloseProp,
  onOpenChange,
  refetch,
  triggerType = "button",
  triggerClassName = "",
}) => {
  const {
    isOpen: internalIsOpen,
    open: internalOpen,
    close: internalClose,
    formData,
    handleChange,
    handleSubmit,
    setFormData,
    loading,
    error,
    validationErrors,
    handlePasswordChange,
    addPasswordField,
    removePasswordField,
    getTypeLabel,
  } = useFormAccount({
    editingAccount,
    onSuccess,
    isOpenProp,
    onCloseProp,
    refetch,
  });

  const isOpen = isOpenProp !== undefined ? isOpenProp : internalIsOpen;
  const open = () => {
    if (onOpenChange) {
      onOpenChange(true);
    } else {
      internalOpen();
    }
  };
  const close = () => {
    if (onCloseProp) {
      onCloseProp();
    } else {
      internalClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const getTypeIcon = (type: SecretType) => {
    switch (type) {
      case SecretType.RESET_PASSWORD:
        return <Key className="w-4 h-4" />;
      case SecretType.API_KEY:
        return <FileCode className="w-4 h-4" />;
      case SecretType.ACCOUNTS:
        return <Shield className="w-4 h-4" />;
      default:
        return <StickyNote className="w-4 h-4" />;
    }
  };

  const renderTrigger = () => {
    if (editingAccount) {
      return null;
    }

    const buttonClassName = `gap-2 ${triggerClassName}`;

    switch (triggerType) {
      case "icon":
        return (
          <Button
            onClick={open}
            size="icon"
            className={`rounded-full dark:bg-zinc-600 dark:hover:bg-zinc-700 ${triggerClassName}`}
          >
            <Plus className="w-5 h-5" />
          </Button>
        );
      case "text":
        return (
          <Button onClick={open} variant="outline" className={buttonClassName}>
            <Plus className="w-4 h-4" />
            Add New Account
          </Button>
        );
      default:
        return (
          <Button
            onClick={open}
            className={`dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-3xl ${buttonClassName}`}
          >
            <Plus className="w-4 h-4" />
            Add New Account
          </Button>
        );
    }
  };

  const handleTypeChange = (value: SecretType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleEditorChange = (
    value:
      | string
      | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
  ) => {
    if (typeof value === "string") {
      setFormData((prev) => ({ ...prev, description: value }));
      setFormData((prev) => ({ ...prev, notes: value }));
    } else {
      handleChange(value);
    }
  };

  return (
    <>
      {/* Botão Trigger */}
      {renderTrigger()}

      {/* Modal */}
      <CustomModal
        isOpen={isOpen}
        onClose={close}
        title={editingAccount ? "Edit Secret" : "Add Secret"}
        maxWidth="md:max-w-lg max-w-md  lg:max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2"
              >
                Title *
              </Label>
              <Input
                id="title"
                name="title"
                autoFocus
                type="text"
                placeholder="Database Primary Key"
                value={formData.title}
                onChange={handleChange}
                required
                className={validationErrors.title ? "border-red-500" : ""}
              />
              {validationErrors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Type Selector */}
            <div>
              <Label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Type
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(formData.type)}
                        <span>{getTypeLabel(formData.type)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="center">
                    {Object.values(SecretType).map((typeValue) => (
                      <SelectItem
                        key={typeValue}
                        value={typeValue}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          {getTypeIcon(typeValue)}
                          {getTypeLabel(typeValue)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2"
              >
                Description (Optional)
              </Label>
              <EditorContent
                id="description"
                name="description"
                placeholder="Brief context about this entry..."
                rows={2}
                value={formData.description}
                onChange={handleEditorChange}
              />
            </div>

            <div>
              <Label
                htmlFor="url"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2"
              >
                URL (Optional)
              </Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com/login"
                value={formData.url}
                onChange={handleChange}
                className={validationErrors.url ? "border-red-500" : ""}
              />
              {validationErrors.url && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.url}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="icon"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2"
              >
                Icon URL (Optional)
              </Label>
              <Input
                id="icon"
                name="icon"
                type="url"
                placeholder="https://example.com/icon.png"
                value={formData.icon}
                onChange={handleChange}
                className={validationErrors.icon ? "border-red-500" : ""}
              />
              {validationErrors.icon && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.icon}
                </p>
              )}
            </div>

            {/* Passwords Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Passwords
                </Label>
                <Button
                  type="button"
                  onClick={addPasswordField}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Add Password
                </Button>
              </div>

              <div className="space-y-3">
                {formData.password.map((password, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      type="password"
                      placeholder={`Password ${index + 1}`}
                      value={password}
                      onChange={(e) =>
                        handlePasswordChange(index, e.target.value)
                      }
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removePasswordField(index)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {formData.password.length === 0 && (
                  <p className="text-sm text-zinc-500 italic">
                    No passwords added. Click &quot;Add Password&quot; to add
                    one.
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="notes"
                className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2"
              >
                Notes (Optional)
              </Label>
              <EditorContent
                id="notes"
                name="notes"
                placeholder="Additional notes or instructions..."
                rows={3}
                value={formData.notes}
                onChange={handleEditorChange}
                className="resize-none"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              onClick={close}
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : editingAccount ? (
                "Update Secret"
              ) : (
                "Create Secret"
              )}
            </Button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default AddSecretModal;
