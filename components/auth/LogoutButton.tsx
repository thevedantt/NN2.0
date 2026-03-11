"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
    showLabel?: boolean;
}

export function LogoutButton({
    variant = "destructive",
    size = "default",
    className = "",
    showIcon = true,
    showLabel = true,
}: LogoutButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                // Clear client-side storage
                localStorage.removeItem("token");

                toast.success("Logged out successfully", {
                    description: "You have been signed out.",
                });

                router.push("/auth/login");
            } else {
                toast.error("Logout failed", {
                    description: "Something went wrong. Please try again.",
                });
            }
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("An error occurred", {
                description: "Could not log out. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogout}
            disabled={isLoading}
        >
            {showIcon && <LogOut className="h-4 w-4 mr-2" />}
            {showLabel && (isLoading ? "Signing out..." : "Sign Out")}
        </Button>
    );
}
