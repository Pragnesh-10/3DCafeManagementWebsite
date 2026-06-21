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

// Simple Auth Guard
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const userRole = localStorage.getItem("user_role");
  if (userRole !== role) {
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
    path: "/customer",
    element: (
      <ProtectedRoute role="customer">
        <CustomerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    Component: Root,
    children: [
      { 
        index: true, 
        element: (
          <ProtectedRoute role="admin">
            <Dashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "orders", 
        element: (
          <ProtectedRoute role="admin">
            <Orders />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "inventory", 
        element: (
          <ProtectedRoute role="admin">
            <Inventory />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "billing", 
        element: (
          <ProtectedRoute role="admin">
            <Billing />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "employees", 
        element: (
          <ProtectedRoute role="admin">
            <Employees />
          </ProtectedRoute>
        ) 
      },
      { 
        path: "customers", 
        element: (
          <ProtectedRoute role="admin">
            <Customers />
          </ProtectedRoute>
        ) 
      },
    ],
  },
]);
