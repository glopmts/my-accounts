"use client";

import { Menu } from "lucide-react";
import { User } from "../types/user-interfaces";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar-custom";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

type PropsMenu = {
  Links: {
    name: string;
    href: string;
  }[];
  user: User | null;
  handleSignOut: () => void;
};

const MenuMobile = ({ Links, user, handleSignOut }: PropsMenu) => {
  const pathame = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Avatar className={cn("w-9 h-9 cursor-pointer")}>
              <AvatarImage
                src={user?.image || ""}
                alt={user?.name || "User Avatar"}
              />
              <AvatarFallback>
                {user?.name ? user.name.charAt(0) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <SheetTitle>Óla, {user?.name || "User"}</SheetTitle>
              <span className="text-sm text-zinc-400">{user?.email}</span>
            </div>
          </div>
          <SheetDescription>
            Gerencie suas contas, senhas e muitos mais...
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex flex-col gap-2 px-2.5">
            {Links.map((link) => (
              <Button
                key={link.name}
                asChild
                variant={`${pathame === link.href ? "secondary" : "ghost"}`}
              >
                <Link href={link.href} className="hover:underline">
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
          <div className="w-full h-full px-2.5 flex items-end pb-5">
            <Button
              onClick={handleSignOut}
              variant={"destructive"}
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuMobile;
