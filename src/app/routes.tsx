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

// Auth Guard for Admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const userRole = sessionStorage.getItem("user_role");
  if (userRole !== "admin") {
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
]);
