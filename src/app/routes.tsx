import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Inventory } from "./pages/Inventory";
import { Billing } from "./pages/Billing";
import { Employees } from "./pages/Employees";
import { Customers } from "./pages/Customers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
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
