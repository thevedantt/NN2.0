import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function AVCLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <main className="flex-1 overflow-auto bg-background transition-all duration-300 ease-in-out relative flex flex-col min-h-screen">
                <div className="md:hidden p-4 pb-0">
                    <SidebarTrigger />
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}
