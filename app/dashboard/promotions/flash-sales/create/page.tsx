"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { createFlashSale } from "@/app/actions";
import { useFormState } from "react-dom";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { prisma } from "@/lib/db";

const flashSaleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  discountPercentage: z.number().min(1).max(100),
  productIds: z.array(z.string()).min(1, "Select at least one product"),
});

type FlashSaleResult = {
  status: 'success' | 'error';
  message: string;
};

const initialState: FlashSaleResult = {
  status: 'error',
  message: '',
};

type FormAction = (prevState: FlashSaleResult, formData: FormData) => Promise<FlashSaleResult>;

export default function CreateFlashSale() {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products on component mount
  useState(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch((error) => {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products");
      });
  });

  const [lastResult, action] = useFormState<FlashSaleResult, FormData>(
    createFlashSale as FormAction,
    initialState
  );
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: flashSaleSchema });
    },
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("productIds", JSON.stringify(selectedProducts));
    formData.append("startDate", startDate?.toISOString() || "");
    formData.append("endDate", endDate?.toISOString() || "");
    
    await action(formData);
    
    if (lastResult?.status === "success") {
      toast.success(lastResult.message);
      router.push("/dashboard/promotions/flash-sales");
    } else if (lastResult?.status === "error") {
      toast.error(lastResult.message);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Flash Sale</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Flash Sale Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter flash sale name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter flash sale description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DateTimePicker
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <DateTimePicker
                  id="endDate"
                  name="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <Input
                id="discountPercentage"
                name="discountPercentage"
                type="number"
                min="1"
                max="100"
                placeholder="Enter discount percentage"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={product.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {product.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "ZAR",
                        }).format(product.price / 100)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit">Create Flash Sale</Button>
        </div>
      </form>
    </div>
  );
} 