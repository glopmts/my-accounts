"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { FC } from "react";

type InfoAlertSessionProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InfoAlertSession: FC<InfoAlertSessionProps> = ({ isOpen, onClose }) => {
  const t = useTranslations("session.modal");
  const tButton = useTranslations("button");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="hidden">
          {t("title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t("message")}</p>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{tButton("close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoAlertSession;
