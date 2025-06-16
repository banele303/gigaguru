import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { UserDropdown } from "./UserDropdown";

interface iAppProps {
  email: string;
  name: string;
  userImage: string;
}

export function Navigation({ email, name, userImage }: iAppProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              ShoeMarshal
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/products"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserDropdown email={email} name={name} userImage={userImage} />
        </div>
      </div>
    </header>
  );
} 