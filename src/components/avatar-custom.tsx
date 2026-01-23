"use client";

import { cn } from "@/lib/utils";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { Loader2, User } from "lucide-react";
import * as React from "react";

interface AvatarProps extends React.ComponentProps<
  typeof AvatarPrimitive.Root
> {
  status?: "online" | "offline" | "idle" | "busy";
  isBordered?: boolean;
  isLoading?: boolean;
  glowEffect?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

function Avatar({
  className,
  status,
  isBordered = false,
  isLoading = false,
  glowEffect = false,
  size = "md",
  ...props
}: AvatarProps) {
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12",
    xl: "size-16",
  };

  const borderSize = {
    sm: "border-2",
    md: "border-[2.5px]",
    lg: "border-3",
    xl: "border-4",
  };

  return (
    <div className="relative inline-block">
      {/* Glow effect */}
      {glowEffect && (
        <div className="absolute -inset-0.5 bg-linear-to-r from-zinc-600 to-zinc-400 rounded-full blur opacity-0 hover:opacity-50 transition-opacity duration-300 group-hover:opacity-50" />
      )}

      {/* Main avatar container */}
      <AvatarPrimitive.Root
        data-slot="avatar"
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full transition-all duration-200",
          sizeClasses[size],
          isBordered && `${borderSize[size]} border-zinc-800`,
          isLoading && "animate-pulse",
          "group",
          className,
        )}
        {...props}
      />

      {/* Status indicator */}
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-zinc-900 transition-all duration-200",
            size === "sm" && "size-2.5",
            size === "md" && "size-3",
            size === "lg" && "size-3.5",
            size === "xl" && "size-4",
            status === "online" && "bg-emerald-500",
            status === "offline" && "bg-zinc-600",
            status === "idle" && "bg-amber-500",
            status === "busy" && "bg-red-500",
          )}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 rounded-full">
          <Loader2 className="size-4 text-zinc-400 animate-spin" />
        </div>
      )}
    </div>
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full object-cover transition-transform duration-300 group-hover:scale-105",
        className,
      )}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends React.ComponentProps<
  typeof AvatarPrimitive.Fallback
> {
  showInitials?: boolean;
  name?: string;
}

function AvatarFallback({
  className,
  showInitials = true,
  name,
  children,
  ...props
}: AvatarFallbackProps) {
  const getInitials = () => {
    if (!name) return null;

    const cleanedName = name.trim().replace(/[^\p{L}\s]/gu, "");

    const words = cleanedName.split(/\s+/).filter((word) => word.length > 0);

    if (words.length === 0) return null;

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials();

  const fallbackContent = React.useMemo(() => {
    if (showInitials && initials) {
      return (
        <span className="font-semibold text-zinc-300 tracking-wide select-none">
          {initials}
        </span>
      );
    }

    if (children) {
      return children;
    }

    return <User className="size-1/2 text-zinc-500" />;
  }, [showInitials, initials, children]);

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-gradient-to-br from-zinc-800 to-zinc-900 flex size-full items-center justify-center rounded-full",
        "transition-all duration-200 group-hover:from-zinc-700 group-hover:to-zinc-800",
        "select-none",
        className,
      )}
      {...props}
    >
      {fallbackContent}
    </AvatarPrimitive.Fallback>
  );
}

// Variant components for different styles
function AvatarGroup({
  children,
  className,
  max = 4,
  spacing = "-space-x-3",
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  spacing?: string;
}) {
  const childrenArray = React.Children.toArray(children);
  const displayChildren = childrenArray.slice(0, max);
  const excess = childrenArray.length - max;

  return (
    <div className={cn("flex items-center", spacing, className)}>
      {displayChildren.map((child, index) => (
        <div
          key={index}
          className="relative transition-transform duration-200 hover:-translate-y-1 hover:z-10"
        >
          {child}
        </div>
      ))}
      {excess > 0 && (
        <div className="relative">
          <div className="size-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-zinc-900 flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-300">
              +{excess}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Avatar with tooltip (requires separate Tooltip component)
function AvatarWithTooltip({
  src,
  alt,
  name,
  email,
  className,
  ...props
}: AvatarProps & {
  src?: string;
  alt?: string;
  name?: string;
  email?: string;
}) {
  return (
    <div className="group relative">
      <Avatar className={cn("cursor-pointer", className)} {...props}>
        {src && <AvatarImage src={src} alt={alt || name || "Avatar"} />}
        <AvatarFallback name={name} />
      </Avatar>

      {/* Tooltip - remove if you don't want it */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-zinc-800/95 backdrop-blur-sm text-white text-xs rounded-lg py-2 px-3 shadow-xl border border-zinc-700/50 whitespace-nowrap">
          {name && <div className="font-semibold">{name}</div>}
          {email && <div className="text-zinc-400 text-[10px]">{email}</div>}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-zinc-800/95"></div>
        </div>
      </div>
    </div>
  );
}

export { Avatar, AvatarFallback, AvatarGroup, AvatarImage, AvatarWithTooltip };
