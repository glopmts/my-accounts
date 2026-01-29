import { SecretType } from "@/app/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MyAccounts } from "@/types/interfaces";
import {
  Eye,
  EyeOff,
  FileCode,
  Fingerprint,
  Key,
  KeyRound,
  Lock,
  MessageSquare,
  Notebook,
  Plus,
  Shield,
  StickyNote,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useFormAccount } from "../../hooks/use-form-account";
import CustomModal from "../custom-modal";
import EditorContent from "../md-editor";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

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

  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

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

  const getPasswordTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <Lock className="w-4 h-4" />;
      case "pin":
        return <Fingerprint className="w-4 h-4" />;
      case "token":
        return <KeyRound className="w-4 h-4" />;
      case "security_answer":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
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
            Nova conta
          </Button>
        );
      default:
        return (
          <Button
            onClick={open}
            className={`dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-3xl ${buttonClassName}`}
          >
            <Plus className="w-4 h-4" />
            Nova conta
          </Button>
        );
    }
  };

  const handleTypeChange = (value: SecretType) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handlePasswordTypeChange = (index: number, value: string) => {
    handlePasswordChange(index, "type", value);
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

  const togglePasswordVisibility = (index: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      {/* Botão Trigger */}
      {renderTrigger()}

      {/* Modal */}
      <CustomModal
        isOpen={isOpen}
        onClose={close}
        title={editingAccount ? "Edit Conta" : "Nova Conta"}
        maxWidth="md:max-w-2xl max-w-md lg:max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2"
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
              <Label className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2">
                Type
              </Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="url"
                  className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2"
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
                  className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2"
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
            </div>

            <div>
              <Label
                htmlFor="description"
                className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2"
              >
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief context about this entry..."
                rows={2}
                value={formData.description}
                onChange={handleChange}
                className="resize-none"
              />
            </div>

            {/* Passwords Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest">
                  Passwords
                </Label>
                <Button
                  type="button"
                  onClick={addPasswordField}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Password
                </Button>
              </div>

              <div className="space-y-4">
                {formData.passwords.map((password, index) => (
                  <div
                    key={index}
                    className="p-4 border border-zinc-700 rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Notebook className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium">
                          Password {index + 1}
                        </span>
                      </div>
                      {formData.passwords.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removePasswordField(index)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">
                          Label *
                        </Label>
                        <Input
                          type="text"
                          placeholder="e.g., Main Password, PIN, Security Answer"
                          value={password.label}
                          onChange={(e) =>
                            handlePasswordChange(index, "label", e.target.value)
                          }
                          className="text-sm"
                        />
                        {validationErrors[`passwords[${index}].label`] && (
                          <p className="mt-1 text-xs text-red-500">
                            {validationErrors[`passwords[${index}].label`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">
                          Type
                        </Label>
                        <Select
                          value={password.type}
                          onValueChange={(value) =>
                            handlePasswordTypeChange(index, value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getPasswordTypeIcon(password.type)}
                                <span className="capitalize">
                                  {password.type}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="password">
                              <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                <span>Password</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pin">
                              <div className="flex items-center gap-2">
                                <Fingerprint className="w-4 h-4" />
                                <span>PIN</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="token">
                              <div className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4" />
                                <span>Token</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="security_answer">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span>Security Answer</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-zinc-500 mb-1 block">
                        Value{" "}
                        {password.id ? "(Leave empty to keep current)" : "*"}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword[index] ? "text" : "password"}
                          placeholder={
                            password.id
                              ? "Enter new value or leave empty to keep current"
                              : "Enter password value"
                          }
                          value={password.value}
                          onChange={(e) =>
                            handlePasswordChange(index, "value", e.target.value)
                          }
                          className="text-sm pr-10"
                        />
                        <Button
                          type="button"
                          onClick={() => togglePasswordVisibility(index)}
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        >
                          {showPassword[index] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {validationErrors[`passwords[${index}].value`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {validationErrors[`passwords[${index}].value`]}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-zinc-500 mb-1 block">
                          Hint (Optional)
                        </Label>
                        <Input
                          type="text"
                          placeholder="Password hint"
                          value={password.hint || ""}
                          onChange={(e) =>
                            handlePasswordChange(index, "hint", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {formData.passwords.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed border-zinc-700 rounded-lg">
                    <Lock className="w-12 h-12 mx-auto text-zinc-600 mb-2" />
                    <p className="text-sm text-zinc-500">
                      No passwords added yet.
                    </p>
                    <Button
                      type="button"
                      onClick={addPasswordField}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Your First Password
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="notes"
                className="block text-xs font-bold dark:text-zinc-400 uppercase tracking-widest mb-2"
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
                "Update Account"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </CustomModal>
    </>
  );
};

export default AddSecretModal;
