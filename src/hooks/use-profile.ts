import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "../lib/axios";
import { useAuthCustom } from "../lib/useAuth";

export function useProfile() {
  const { user, isLoading, userId, error, refetch } = useAuthCustom();
  const [isEdite, setEdite] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    image: user?.image || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        image: user.image || "",
      });
    }
  }, [user]);

  const handleEdite = () => {
    setEdite((prev) => !prev);
  };

  const handleUpdate = async () => {
    if (!userId) {
      toast.error("Usuário não encontrado");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }

    try {
      setIsUpdate(true);

      const response = await api.put("/user/update", {
        userId: userId,
        ...form,
      });

      if (response.data.success) {
        toast.success("Perfil atualizado com sucesso!");
        refetch();
        setIsUpdate(false);
        setEdite(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Erro ao atualizar perfil");
      setIsUpdate(false);
    }
  };

  const handleImageUpload = async (url: string) => {
    if (!userId) {
      toast.error("Usuário não encontrado");
      return;
    }

    try {
      setIsUploading(true);

      setForm((prev) => ({ ...prev, image: url }));

      const response = await api.put("/user/update", {
        userId: userId,
        image: url,
      });

      if (response.data.success) {
        toast.success("Imagem de perfil atualizada!");
        refetch();
      }
    } catch (error) {
      console.error("Image update error:", error);
      toast.error("Erro ao atualizar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!userId) {
      toast.error("Usuário não encontrado");
      return;
    }

    try {
      setIsSendingVerification(true);

      const response = await api.post("/auth/send-verification-email", {
        userId: userId,
        email: user?.email,
      });

      if (response.data.success) {
        toast.success(
          "Email de verificação enviado! Verifique sua caixa de entrada.",
        );
      } else {
        toast.error(response.data.message || "Erro ao enviar email");
      }
    } catch (error) {
      console.error("Verification email error:", error);
      toast.error("Erro ao enviar email de verificação" + error);
    } finally {
      setIsSendingVerification(false);
    }
  };

  return {
    user,
    isLoading,
    userId,
    error,

    isEdite,
    isUpdate,
    isSendingVerification,
    isUploading,

    form,

    refetch,
    setEdite,
    setForm,
    handleEdite,
    handleImageUpload,
    handleSendVerificationEmail,
    handleUpdate,
  };
}
