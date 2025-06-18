"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FilterControls({
  setFilter,
  closeSheet,
  initialFilters = {},
}: {
  setFilter: (filter: any) => void;
  closeSheet: () => void;
  initialFilters?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || "",
    brand: searchParams.get('brand') || "",
    material: searchParams.get('material') || "",
    size: searchParams.get('size') || "",
    color: searchParams.get('color') || "",
    minPrice: searchParams.get('minPrice') || "",
    maxPrice: searchParams.get('maxPrice') || "",
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || "",
      brand: searchParams.get('brand') || "",
      material: searchParams.get('material') || "",
      size: searchParams.get('size') || "",
      color: searchParams.get('color') || "",
      minPrice: searchParams.get('minPrice') || "",
      maxPrice: searchParams.get('maxPrice') || "",
    });
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value === "all" ? "" : value }));
  };

  const updateUrlParams = (newFilters: typeof filters) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleFilter = () => {
    updateUrlParams(filters);
    setFilter(filters);
    closeSheet();
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: "",
      brand: "",
      material: "",
      size: "",
      color: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(clearedFilters);
    router.push(pathname);
    setFilter(clearedFilters);
    closeSheet();
  };

  return (
    <div className="p-4 space-y-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
        Filters
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="text-lg font-medium text-gray-700">Category</Label>
          <Select
            name="category"
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
              <SelectValue placeholder="All Categories" className="text-gray-900" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all" className="text-gray-900 hover:bg-gray-100">All Categories</SelectItem>
              <SelectItem value="men" className="text-gray-900 hover:bg-gray-100">Men</SelectItem>
              <SelectItem value="women" className="text-gray-900 hover:bg-gray-100">Women</SelectItem>
              <SelectItem value="kids" className="text-gray-900 hover:bg-gray-100">Kids</SelectItem>
              <SelectItem value="sports" className="text-gray-900 hover:bg-gray-100">Sports</SelectItem>
              <SelectItem value="home" className="text-gray-900 hover:bg-gray-100">Home</SelectItem>
              <SelectItem value="beauty" className="text-gray-900 hover:bg-gray-100">Beauty</SelectItem>
              <SelectItem value="jewellery" className="text-gray-900 hover:bg-gray-100">Jewellery</SelectItem>
              <SelectItem value="technology" className="text-gray-900 hover:bg-gray-100">Technology</SelectItem>
              <SelectItem value="brands" className="text-gray-900 hover:bg-gray-100">Brands</SelectItem>
              <SelectItem value="deals" className="text-gray-900 hover:bg-gray-100">Deals</SelectItem>
              <SelectItem value="sale" className="text-gray-900 hover:bg-gray-100">Sale</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="brand" className="text-lg font-medium text-gray-700">
            Brand
          </Label>
          <Input
            id="brand"
            name="brand"
            placeholder="e.g. Nike, Adidas"
            value={filters.brand}
            onChange={handleInputChange}
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <Label
            htmlFor="material"
            className="text-lg font-medium text-gray-700"
          >
            Material
          </Label>
          <Input
            id="material"
            name="material"
            placeholder="e.g. Leather, Canvas"
            value={filters.material}
            onChange={handleInputChange}
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <Label htmlFor="size" className="text-lg font-medium text-gray-700">
            Size
          </Label>
          <Input
            id="size"
            name="size"
            placeholder="e.g. 10, 11.5"
            value={filters.size}
            onChange={handleInputChange}
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <Label htmlFor="color" className="text-lg font-medium text-gray-700">
            Color
          </Label>
          <Input
            id="color"
            name="color"
            placeholder="e.g. Red, Blue"
            value={filters.color}
            onChange={handleInputChange}
            className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex gap-x-4 items-center">
          <div className="flex-1">
            <Label
              htmlFor="minPrice"
              className="text-lg font-medium text-gray-700"
            >
              Min Price
            </Label>
            <Input
              id="minPrice"
              type="number"
              name="minPrice"
              placeholder="0"
              value={filters.minPrice}
              onChange={handleInputChange}
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div className="flex-1">
            <Label
              htmlFor="maxPrice"
              className="text-lg font-medium text-gray-700"
            >
              Max Price
            </Label>
            <Input
              id="maxPrice"
              type="number"
              name="maxPrice"
              placeholder="1000"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <Button
          onClick={handleFilter}
          className="flex-1 py-3 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="py-3 text-lg font-semibold"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export function FilterSidebar({
  setFilter,
}: {
  setFilter: (filter: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // Get initial filters from URL
  const initialFilters = {
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 p-4 border-r">
        <FilterControls
          setFilter={setFilter}
          closeSheet={() => {}}
          initialFilters={initialFilters}
        />
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-x-2">
              <FilterIcon size={20} />
              <span className="text-lg">Filters</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-sm">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">
                Product Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterControls
                setFilter={setFilter}
                closeSheet={() => setOpen(false)}
                initialFilters={initialFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}