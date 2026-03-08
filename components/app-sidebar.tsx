"use client"

import {
  Bot,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Menu,
  User,
  Users,
  Settings,
  Wind,
  Gamepad2,
  BookOpen,
  Lightbulb,
  Phone,
  Lock,
  Dog,
} from "lucide-react"

import { useLanguage } from "@/context/LanguageContext"
import { useOffline } from "@/context/OfflineContext"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AppSidebar() {
  const { toggleSidebar } = useSidebar()
  const { t } = useLanguage()
  const { isOffline, toggleOfflineMode } = useOffline()

  const profileItem = {
    title: "Profile",
    url: "/profile",
    icon: User,
  }

  // Online-dependent items
  const items = [
    {
      title: t("nav_dashboard"),
      url: "/dashboard",
      icon: LayoutDashboard,
      disabled: false,
    },
    {
      title: t("qa_ai_companion"),
      url: "/chat-ai",
      icon: Bot,
      disabled: isOffline,
    },
    {
      title: "NeuroPet",
      url: "/neuropet",
      icon: Dog,
      disabled: false,
    },
    {
      title: t("qa_assessment"),
      url: "/assessment",
      icon: ClipboardList,
      disabled: isOffline,
    },
    {
      title: t("qa_join_group"),
      url: "/groups",
      icon: Users,
      disabled: isOffline,
    },
    {
      title: "AVC Coaching",
      url: "/avc",
      icon: Users, // Using shared icon, or maybe Sparkles/Video if imported
      disabled: isOffline,
    },
    {
      title: t("nav_appointments"),
      url: "/appointments",
      icon: Calendar,
      disabled: isOffline,
    },
    {
      title: t("nav_settings"),
      url: "/settings",
      icon: Settings,
      disabled: false,
    },
  ]

  const offlineTools = [
    {
      title: t("offline_breathing"),
      url: "/offline/breathing",
      icon: Wind,
    },
    {
      title: t("offline_mood"),
      url: "/offline/mood",
      icon: ClipboardList,
    },
    {
      title: t("offline_games"),
      url: "/offline/games",
      icon: Gamepad2,
    },
    {
      title: t("offline_journal"),
      url: "/offline/journal",
      icon: BookOpen,
    },
    {
      title: t("offline_tips"),
      url: "/offline/tips",
      icon: Lightbulb,
    },
    {
      title: t("offline_help"),
      url: "/offline/help",
      icon: Phone,
    },
  ]

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-col gap-4 py-4 px-4 h-auto group-data-[collapsible=icon]:h-16 group-data-[collapsible=icon]:justify-center">
          <div className="flex flex-row items-center justify-between w-full group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-bold text-primary">
              NeuroNet
            </h1>
            <SidebarTrigger />
          </div>

          <div className="group-data-[collapsible=icon]:hidden w-full">
            <Tabs value={isOffline ? "offline" : "online"} onValueChange={(v) => toggleOfflineMode(v === "offline")}>
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="online" className="text-xs">{t('offline_online_label')}</TabsTrigger>
                <TabsTrigger value="offline" className="text-xs">{t('offline_offline_label')}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="hidden group-data-[collapsible=icon]:block">
            <SidebarTrigger />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={item.disabled ? "opacity-50" : ""}
                      disabled={item.disabled}
                    >
                      <a
                        href={item.disabled ? undefined : item.url}
                        className={item.disabled ? "pointer-events-none flex items-center gap-2" : "flex items-center gap-2"}
                        onClick={(e) => { if (item.disabled) e.preventDefault() }}
                      >
                        <item.icon />
                        <span className="flex-1">{item.title}</span>
                        {item.disabled && <Lock className="w-3 h-3 ml-2" />}
                      </a>
                    </SidebarMenuButton>
                    {item.disabled && (
                      <div className="pl-8 text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {t('offline_available_online')}
                      </div>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className={isOffline ? "text-primary font-bold" : ""}>{t('offline_tools_label')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {offlineTools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}>
                        <item.icon className={isOffline ? "text-primary" : ""} />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {isOffline && (
              <div className="px-2 py-2 mb-2 text-xs text-center text-muted-foreground bg-muted/50 rounded-md group-data-[collapsible=icon]:hidden">
                {t('offline_mode_active')}
              </div>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={profileItem.title}>
                <a href={profileItem.url}>
                  <profileItem.icon />
                  <span>{profileItem.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="bg-background/80 backdrop-blur-sm border shadow-sm rounded-full"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </>
  )
}
