import React from "react";
import { useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Utensils, Package, Receipt, Users, UserSquare } from "lucide-react";
import { LimelightNav, type NavItem } from "./ui/limelight-nav";

const ROUTES = [
  { path: "/", label: "Overview", Icon: LayoutDashboard },
  { path: "/orders", label: "Orders", Icon: Utensils },
  { path: "/inventory", label: "Inventory", Icon: Package },
  { path: "/billing", label: "Billing", Icon: Receipt },
  { path: "/employees", label: "Team", Icon: Users },
  { path: "/customers", label: "Customers", Icon: UserSquare },
];

export function Dock() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = Math.max(
    0,
    ROUTES.findIndex((r) => r.path === location.pathname)
  );

  const items: NavItem[] = ROUTES.map(({ path, label, Icon }) => ({
    id: path,
    label,
    icon: <Icon strokeWidth={2} />,
    onClick: () => navigate(path),
  }));

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <LimelightNav
        /* remount when route changes so the limelight re-seeks the active tab */
        key={location.pathname}
        items={items}
        defaultActiveIndex={activeIndex}
        className="bg-paper/90 backdrop-blur-md border-line shadow-[0_12px_40px_-12px_rgba(44,33,24,0.35)] rounded-2xl"
        iconClassName="text-espresso"
      />
    </div>
  );
}
