import { Secret, SecretType } from "@/types/interfaces";
import { FileCode, Key, Shield, StickyNote, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface AddSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (secret: any) => void;
  editingSecret?: Secret | null;
}

const AddSecretModal: React.FC<AddSecretModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSecret,
}) => {
  const [type, setType] = useState<SecretType>("password");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (editingSecret) {
      setType(editingSecret.type);
      setTitle(editingSecret.title);
      setDescription(editingSecret.description);
      setValue(editingSecret.value);
    } else {
      reset();
    }
  }, [editingSecret, isOpen]);

  const reset = () => {
    setType("password");
    setTitle("");
    setDescription("");
    setValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !value) return;

    onSave({ type, title, description, value });
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-zinc-100">
              {editingSecret ? "Edit Secret" : "Add Secret"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "password",
                label: "Password",
                icon: <Key className="w-4 h-4" />,
              },
              {
                id: "env",
                label: "Env Var",
                icon: <FileCode className="w-4 h-4" />,
              },
              {
                id: "note",
                label: "Note",
                icon: <StickyNote className="w-4 h-4" />,
              },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id as SecretType)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  type === item.id
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                    : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {item.icon}
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Title
              </label>
              <input
                autoFocus
                type="text"
                placeholder="Database Primary Key"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Brief context about this entry..."
                rows={2}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                {type === "password"
                  ? "Password"
                  : type === "env"
                    ? "Variable Value"
                    : "Secret Content"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    type === "env"
                      ? "API_KEY=sk_test_..."
                      : "Enter sensitive content..."
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-3 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              {editingSecret ? "Update Secret" : "Create Secret"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSecretModal;
