import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Inventory } from "./pages/Inventory";
import { Billing } from "./pages/Billing";
import { Employees } from "./pages/Employees";
import { Customers } from "./pages/Customers";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { CustomerDashboard } from "./pages/CustomerDashboard";

// Auth Guard for Admin - restricted to local hostname only and automatic login
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "[::1]");

  if (!isLocal) {
    // Block admin access completely in production environments
    return <Navigate to="/" replace />;
  }

  // Force Admin session when accessing /admin locally
  sessionStorage.setItem("user_role", "admin");
  sessionStorage.setItem("user_name", "Admin");

  return <>{children}</>;
};

// Auth Guard for Staff Manager - requires active session
const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
  const userRole = sessionStorage.getItem("user_role");
  
  if (userRole !== "staff_manager") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/order",
    Component: CustomerDashboard, // Publicly accessible for "Start your order"
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Root />
      </AdminRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: "orders", Component: Orders },
      { path: "inventory", Component: Inventory },
      { path: "billing", Component: Billing },
      { path: "employees", Component: Employees },
      { path: "customers", Component: Customers },
    ],
  },
  {
    path: "/manager",
    element: (
      <ManagerRoute>
        <Root />
      </ManagerRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/manager/orders" replace /> },
      { path: "orders", Component: Orders },
      { path: "inventory", Component: Inventory },
      { path: "customers", Component: Customers },
    ],
  },
]);
