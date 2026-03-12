import { toast } from "sonner";

export const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  } catch (err) {
    toast.error("Falha ao copiar" + err);
  }
};
