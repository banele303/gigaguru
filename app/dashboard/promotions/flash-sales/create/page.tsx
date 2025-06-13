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

export default function CreateFlashSale() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name"),
        description: formData.get("description"),
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        discountPercentage: formData.get("discountPercentage"),
      };

      // TODO: Add API call to create flash sale
      console.log("Flash sale data:", data);
      
      toast.success("Flash sale created successfully!");
      router.push("/dashboard/promotions/flash-sales");
    } catch (error) {
      toast.error("Failed to create flash sale");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Flash Sale</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flash Sale Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                required
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Flash Sale"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 