"use client"

import * as React from "react"
import { LifeBuoy } from "lucide-react"
import { NavGroup } from "./nav-group"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { useState } from "react";
import { NavSecondary } from "./nav-secondary"
import { useGlobalStore } from "@/store/globalStore"
import { useInitialFetchRobots } from "@/hooks/use-initial-fetch-robots"
import { NavHeader } from "@/components/nav-header";
import { TeamSwitcher } from "@/components/team-switcher";
import { useSpaceDrag } from "@/hooks/use-space-api"

const data = {
  navSupport: [
    {
      name: "Admin Area",
      url: "/admin/overview",
      icon: LifeBuoy,
    },
  ],
}


export type ActiveMenu = {
  appId: string;
  name: string;
} | null;
export const AppSideBarHistoryListContext = React.createContext<{
  activeMenu: ActiveMenu;
  toggleMenu: (menu: ActiveMenu) => void;
}>({
  activeMenu: null,
  toggleMenu: () => { },
});

export const AppSideBarHistoryListContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const toggleMenu = (menu: ActiveMenu) => {
    setActiveMenu(prevMenu => prevMenu?.appId === menu?.appId ? null : menu);
  };
  return (
    <AppSideBarHistoryListContext.Provider value={{ activeMenu, toggleMenu }}>
      {children}
    </AppSideBarHistoryListContext.Provider>
  );
}

export const useAppSideBarHistoryListContext = () => {
  const context = React.useContext(AppSideBarHistoryListContext);
  if (!context) {
    throw new Error("useAppSideBarHistoryListContext must be used within a AppSideBarHistoryListContextProvider");
  }
  return context;
}


export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = useGlobalStore(state => state.user);
  const { appList } = useInitialFetchRobots();
  const { onDragEnd } = useSpaceDrag();

  return (
    <div className="flex h-full">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher
            currentTeam={user.currentTeam}
            teams={user.teams}
          />
       
        </SidebarHeader>
        <SidebarContent>
          <NavHeader />
          {/*<NavGroup items={favoriteAppList} groupName="Favorite" maked />*/}
          <NavGroup items={appList} groupName="Workspace" draggable onDragEnd={onDragEnd} showAdd maked />
          <NavGroup items={data.navSupport} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>
      <NavSecondary />
    </div>
  )
}

