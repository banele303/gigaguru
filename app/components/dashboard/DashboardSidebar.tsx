"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Tag,
  Bell,
  Mail,
  Settings,
  Calendar,
  Receipt,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    subItems: [
      {
        name: "All Orders",
        href: "/dashboard/orders",
      },
      {
        name: "Refund Requests",
        href: "/dashboard/orders/refunds",
      },
    ],
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    subItems: [
      {
        name: "All Products",
        href: "/dashboard/products",
      },
      {
        name: "Low Stock Alerts",
        href: "/dashboard/products/low-stock",
      },
    ],
  },
  {
    name: "Banner",
    href: "/dashboard/banner",
    icon: ImageIcon,
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    subItems: [
      {
        name: "All Customers",
        href: "/dashboard/customers",
      },
      {
        name: "Purchase History",
        href: "/dashboard/customers/history",
      },
    ],
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Promotions",
    href: "/dashboard/promotions",
    icon: Tag,
    subItems: [
      {
        name: "Discount Codes",
        href: "/dashboard/promotions/discounts",
      },
      {
        name: "Flash Sales",
        href: "/dashboard/promotions/flash-sales",
      },
    ],
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Email Campaigns",
    href: "/dashboard/email-campaigns",
    icon: Mail,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background overflow-y-auto">
      <div className="flex h-24 items-center border-b px-4 sticky top-0 bg-background z-10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/gigalogo.jpeg"
            alt="SF Shoes Logo"
            width={100}
            height={100}
            className="object-contain"
          />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => (
          <div key={link.href} className="space-y-1">
            <Link
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{link.name}</span>
            </Link>
            {link.subItems && (
              <div className="ml-6 space-y-1">
                {link.subItems.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === subItem.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
} 