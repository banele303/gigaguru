"use client";

import Link from "next/link";
import Image from "next/image";
import { NavbarLinks } from "./NavbarLinks";
import { Menu } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { Button } from "@/components/ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { SearchBar } from "./SearchBar";
import { CartIcon } from "./CartIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCart } from "@/app/context/CartContext";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <LoginLink>Sign in</LoginLink>
      </Button>
      <Button variant="outline" asChild>
        <RegisterLink postLoginRedirectURL="/">Sign up</RegisterLink>
      </Button>
    </div>
  );
}

export function Navbar() {
  const { user } = useKindeBrowserClient();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full bg-white">
      <nav className="container mx-auto flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/gigalogo.jpeg"
              alt="SF Shoes Logo"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>
          <div className="hidden lg:block">
            <NavbarLinks />
          </div>
        </div>

        <div className="hidden lg:flex flex-1 justify-center px-8">
          <SearchBar />
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <UserDropdown
                email={user.email as string}
                name={user.given_name as string}
                userImage={
                  user.picture ?? `https://avatar.vercel.sh/${user.given_name}`
                }
              />
            ) : (
              <AuthButtons />
            )}
          </div>

          <CartIcon />

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-white">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <NavbarLinks />
                </div>
                <div className="mt-4">
                  {user ? (
                     <UserDropdown
                        email={user.email as string}
                        name={user.given_name as string}
                        userImage={
                          user.picture ?? `https://avatar.vercel.sh/${user.given_name}`
                        }
                      />
                  ) : (
                    <AuthButtons />
                  )}
                </div>
                <div className="mt-4 lg:hidden">
                  <SearchBar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
