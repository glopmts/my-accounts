"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useAuthCustom } from "../lib/useAuth";
import { User } from "../types/user-interfaces";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@clerk/nextjs";
import { Settings, User as UserIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar-custom";

const Links = [
  {
    name: "Home",
    href: "/home",
  },
  {
    name: "Profile",
    href: "/profile",
  },
  {
    name: "Arquivados",
    href: "/archived",
  },
];

const Header = () => {
  const [shadoew, setShadow] = useState(false);
  const { user, isLoading, error } = useAuthCustom();
  const { signOut } = useAuth();
  const pathame = usePathname();

  useEffect(() => {
    const handleShadow = () => {
      if (window.scrollY >= 90) {
        setShadow(true);
      } else {
        setShadow(false);
      }
    };

    window.addEventListener("scroll", handleShadow);

    return () => {
      window.removeEventListener("scroll", handleShadow);
    };
  });

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      await signOut();
    }
    toast.success("Signed out successfully");
  };

  return (
    <header
      className={`w-full p-1 sticky top-0 mt-2.5 bg-background z-30 ${shadoew ? "shadow-md" : ""}`}
    >
      <nav className="w-full h-full flex justify-between items-center px-4">
        <Link
          href={"/"}
          className="flex items-center gap-3"
          title="Pagina Inicial"
        >
          <div className="relative w-11 h-11">
            <Image
              src="/icon.ico.png"
              alt="Logo"
              fill
              sizes="100vw"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">Minhas Contas</span>
            <span className="truncate w-28">
              {user?.name ? `Olá, ${user.name}` : "Olá"}
            </span>
          </div>
        </Link>
        {error && <span className="text-red-600">Error: {error.message}</span>}
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
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
          {!isLoading && user && (
            <Suspense>
              <UserDropdown user={user} logout={handleSignOut} />
            </Suspense>
          )}
        </div>
      </nav>
    </header>
  );
};

type UserDropdownProps = {
  user: User | null;
  logout: () => void;
};

function UserDropdown({ user, logout }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className={cn("w-9 h-9 cursor-pointer")}>
          <AvatarImage
            src={user?.image || ""}
            alt={user?.name || "User Avatar"}
          />
          <AvatarFallback>
            {user?.name ? user.name.charAt(0) : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex items-center gap-1.5">
              <Avatar className={cn("w-9 h-9 cursor-pointer")}>
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User Avatar"}
                />
                <AvatarFallback>
                  {user?.name ? user.name.charAt(0) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold truncate w-full">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-zinc-400 runcate w-full">
                  {user?.email || "No email"}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 hover:text-red-800 focus:text-red-800">
          <button onClick={logout}>Sign Out</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Header;
