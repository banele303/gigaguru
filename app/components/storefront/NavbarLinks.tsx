"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navbarLinks = [
  {
    id: 1,
    name: "All",
    href: "/products",
  },
  {
    id: 2,
    name: "Women",
    href: "/products?category=women",
  },
  {
    id: 3,
    name: "Men",
    href: "/products?category=men",
  },
    {
    id: 4,
    name: "Kids",
    href: "/products?category=kids",
  },
  {
    id: 5,
    name: "Sports",
    href: "/products?category=sports",
  },
 
  

  {
    id: 6,
    name: "Sale",
    href: "/products?category=sale",
  },
];

export function NavbarLinks() {
  const location = usePathname();
  return (
    <div className="flex items-center gap-x-4">
      {navbarLinks.map((item) => (
        <Link
          href={item.href}
          key={item.id}
          className={cn(
            location === item.href
              ? "text-primary font-semibold"
              : "text-gray-600 hover:text-primary",
            "text-sm font-medium transition-colors duration-200"
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
