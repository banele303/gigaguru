"use client";

import { Button } from "@/components/ui/button";

const categories = [
  "all",
  "men",
  "women",
  "kids",
  "sports",
  "home",
  "beauty",
  "jewellery",
  "technology",
  "brands",
  "deals",
  "sale",
];

export function CategorySelection({
  selectedCategory,
  onCategoryChange,
}: {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          onClick={() => onCategoryChange(category)}
          className={`capitalize w-full transition-transform transform hover:scale-105 ${
            selectedCategory === category 
              ? "bg-primary text-white hover:bg-primary/90" 
              : "bg-white text-gray-900 hover:bg-gray-100 border-gray-200"
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
