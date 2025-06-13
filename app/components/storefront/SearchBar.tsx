"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

// Define Product interface based on component usage
interface Product {
  id: string;
  name: string;
  images: string[];
}
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const debounce = setTimeout(() => {
        fetch(`/api/search?query=${query}`)
          .then((res) => res.json())
          .then((data) => setResults(data));
      }, 300); // 300ms debounce

      return () => clearTimeout(debounce);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${query}`);
      setIsFocused(false);
    }
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full rounded-full px-12 py-3 text-base"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </form>
      {isFocused && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
          <ul>
            {results.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/product/${product.id}`}
                  className="flex items-center p-2 hover:bg-gray-100"
                  onClick={() => setIsFocused(false)}
                >
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="object-cover rounded-md"
                  />
                  <span className="ml-4">{product.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}