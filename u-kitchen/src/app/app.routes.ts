import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Layout } from './layout/layout';
import { UnderConstruction } from './pages/under-construction/under-construction';

export const routes: Routes = [
  {
    path: "",
    component: Layout,
    children: [
      {
        path: "home",
        component: Home,
        title: "U Kitchen"
      },
      {
        path: "employees",
        loadComponent: () => import("./employees/employees-list/employees-list").then(m => m.EmployeesList),
        title: "U Kitchen - Employees"
      },
      // {
      //   path: "clients",
      //   loadComponent: () => import("./employees/employees").then(m => m.Employees),
      //   title: "U Kitchen - Clients"
      // },
      // {
      //   path: "tables",
      //   loadComponent: () => import("./employees/employees").then(m => m.Employees),
      //   title: "U Kitchen - Tables"
      // },
      // {
      //   path: "providers",
      //   loadComponent: () => import("./employees/employees").then(m => m.Employees),
      //   title: "U Kitchen - Providers"
      // },
      {
        path: "under-construction",
        component: UnderConstruction
      }
    ]
  },
  {
    path: "**",
    redirectTo: "under-construction"
  }
];
