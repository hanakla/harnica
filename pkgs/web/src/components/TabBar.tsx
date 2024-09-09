import clsx from "clsx";
import {
  PropsWithChildren,
  createContext,
  memo,
  useContext,
  useMemo,
  useState,
} from "react";
import useEvent from "react-use-event-hook";
import { twx } from "@/utils/tw";

const TabBarContext = createContext<{
  activeTab: string | null;
  setActiveTab: (page: string) => void;
} | null>(null);

export const TabRoot = memo(function TabRoot({
  defaultPage,
  activePage,
  className,
  children,
  onTabChange,
}: PropsWithChildren<{
  defaultPage: string;
  activePage?: string | null;
  className?: string;
  onTabChange?: (pageName: string) => void;
}>) {
  const [activeTabState, setActiveTab] = useState<string | null>(null);
  const activeTab = activePage ?? activeTabState ?? defaultPage;

  const handleChangeTab = useEvent((page: string) => {
    onTabChange?.(page);
    setActiveTab(page);
  });

  const tabBar = useMemo(
    () => ({
      activeTab,
      setActiveTab: handleChangeTab,
    }),
    [activeTab, setActiveTab],
  );

  return (
    <TabBarContext.Provider value={tabBar}>
      <div className={clsx("contents", className)}>{children}</div>
    </TabBarContext.Provider>
  );
});

export const TabBar = memo(function TabBar({
  className,
  children,
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div className={clsx("flex border-b-[1px] overflow-auto", className)}>
      {children}
    </div>
  );
});

export const Tab = memo(function Tab({
  name,
  className,
  children,
}: PropsWithChildren<{
  name: string;
  className?: string;
}>) {
  const tabBar = useContext(TabBarContext)!;

  const handleClick = useEvent(() => {
    tabBar.setActiveTab(name);
  });

  return (
    <button
      className={clsx(
        "appearance-none px-4 py-2 border-t-4 border-transparent text-[12px] whitespace-nowrap",
        tabBar.activeTab === name && `border-t-4 border-t-indigo-400`,
        className,
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
});

export const TabPage = memo(function TabPage({
  name,
  className,
  children,
}: PropsWithChildren<{ name: string; className?: string }>) {
  const tabBar = useContext(TabBarContext)!;

  return (
    <div
      className={twx(
        tabBar.activeTab !== name && "hidden",
        "p-[16px]",
        className,
      )}
    >
      {children}
    </div>
  );
});

export const Tabs = {
  Root: TabRoot,
  TabBar,
  Tab,
  TabPage,
};
