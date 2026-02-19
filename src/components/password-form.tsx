"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lock,
  MessageSquare,
  Notebook,
  X,
} from "lucide-react";
import { useState } from "react";
import { SecretType } from "../app/generated/prisma/enums";
import { Plus } from "../types/constantes";
import { PasswordFormData, PasswordFormDataInput } from "../types/interfaces";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type PropsPasswordForm = {
  formData: {
    title: string;
    description: string;
    type: SecretType;
    url: string;
    notes: string;
    icon: string;
    passwords: PasswordFormDataInput[];
  };
  validationErrors: { [key: string]: string } | Record<string, string>;
  addPasswordField: () => void;
  removePasswordField: (index: number) => void;
  handlePasswordChange: (
    index: number,
    field: keyof PasswordFormData,
    value: string,
  ) => void;
  handlePasswordTypeChange: (index: number, value: string) => void;
};

const PasswordForm = ({
  formData,
  validationErrors,
  addPasswordField,
  handlePasswordChange,
  handlePasswordTypeChange,
  removePasswordField,
}: PropsPasswordForm) => {
  const [showPassword, setShowPassword] = useState<Record<number, boolean>>({});

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

  const togglePasswordVisibility = (index: number) => {
    setShowPassword((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
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
                <Label className="text-xs text-zinc-500 mb-1 block">Type</Label>
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
                        <span className="capitalize">{password.type}</span>
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
                Value {password.id ? "(Leave empty to keep current)" : "*"}
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
            <p className="text-sm text-zinc-500">No passwords added yet.</p>
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
  );
};

export default PasswordForm;
