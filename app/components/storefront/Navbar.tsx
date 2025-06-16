import Link from "next/link";
import Image from "next/image";
import { NavbarLinks } from "./NavbarLinks";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Menu } from "lucide-react";
import { UserDropdown } from "./UserDropdown";
import { Button } from "@/components/ui/button";
import {
  LoginLink,
  RegisterLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { redis } from "@/app/lib/redis";
import { Cart } from "@/app/lib/interfaces";
import { SearchBar } from "./SearchBar";
import { CartIcon } from "./CartIcon";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function AuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" asChild className="hover:bg-secondary/80">
        <LoginLink>Sign in</LoginLink>
      </Button>
      <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
        <RegisterLink>Sign up</RegisterLink>
      </Button>
    </div>
  );
}

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const cart: Cart | null = await redis.get(`cart-${user?.id}`);

  const uniqueProducts = cart?.items ? new Set(cart.items.map(item => item.id)).size : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/shoes/logo.png"
              alt="ShoeBlessed Logo"
              width={200}
              height={200}
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
