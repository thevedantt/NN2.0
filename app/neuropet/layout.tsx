import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function NeuroPetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="flex-1 transition-all duration-300 ease-in-out relative h-screen overflow-hidden">
                {children}
            </main>
        </SidebarProvider>
    )
}
