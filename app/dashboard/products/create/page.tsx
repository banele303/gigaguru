"use client";

import { createProduct } from "@/app/actions";
import { UploadDropzone } from "@/app/lib/uplaodthing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { createProductSchema } from "@/app/lib/zodSchemas";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { categories } from "@/app/lib/categories";
import { CreationSubmitButton } from "@/app/components/SubmitButtons";
import { Tag, Ruler, Palette } from "lucide-react";
import { logFormSubmission } from "@/app/lib/debug";
import { DateTimePicker } from "@/components/ui/date-time-picker";



export default function ProductCreateRoute() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState<string>("");
  const [colorInput, setColorInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [isSale, setIsSale] = useState<boolean>(false);
  const [saleEndDate, setSaleEndDate] = useState<Date | undefined>(undefined);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);


  const handleAddSize = () => {
    if (sizeInput && !selectedSizes.includes(sizeInput)) {
      setSelectedSizes([...selectedSizes, sizeInput]);
      setSizeInput(""); // Clear input after adding
    }
  };

  const handleAddColor = () => {
    if (colorInput && !selectedColors.includes(colorInput)) {
      setSelectedColors([...selectedColors, colorInput]);
      setColorInput(""); // Clear input after adding
    }
  };

  const removeSize = (size: string) => {
    setSelectedSizes(selectedSizes.filter(s => s !== size));
  };

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter(c => c !== color));
  };

  const [lastResult, action] = useFormState(createProduct, undefined);
  const router = useRouter();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      const parsed = parseWithZod(formData, { schema: createProductSchema });
      return parsed;
    },
    shouldValidate: "onBlur",
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      toast.success(lastResult.message);
      router.push("/dashboard/products");
    } else if (lastResult?.status === "error") {
      toast.error(lastResult.message);
    }
  }, [lastResult, router]);

  const handleDelete = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form
      id={form.id}
      onSubmit={form.onSubmit}
      action={action}
      className="max-w-7xl mx-auto"
      noValidate
    >
      {images.map((image, index) => (
        <input type="hidden" name={`images[${index}]`} key={`image-${index}`} defaultValue={image} />
      ))}
      {selectedSizes.map((size, index) => (
        <input type="hidden" name={`sizes[${index}]`} key={`size-${index}`} defaultValue={size} />
      ))}
      {selectedColors.map((color, index) => (
        <input type="hidden" name={`colors[${index}]`} key={`color-${index}`} defaultValue={color} />
      ))}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm hover:shadow-md transition-shadow">
          <Link href="/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">New Product</h1>
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-background to-muted border-b">
          <CardTitle className="text-xl">Product Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            Create a new product with all details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label>Name</Label>
                <Input
                  type="text"
                  key={fields.name.key}
                  name={fields.name.name}
                  defaultValue={fields.name.initialValue}
                  className="w-full"
                  placeholder="Product Name"
                />
                <p className="text-red-500">{fields.name.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label>SKU</Label>
                <Input
                  type="text"
                  key={fields.sku?.key}
                  name="sku"
                  className="w-full"
                  placeholder="SKU-12345"
                />
                <p className="text-red-500">{fields.sku?.errors}</p>
              </div>
            </div>

            {/* Description Section */}
            <div className="flex flex-col gap-3">
              <Label>Description</Label>
              <Textarea
                key={fields.description.key}
                name={fields.description.name}
                defaultValue={fields.description.initialValue}
                placeholder="Write your description right here..."
                className="min-h-[100px]"
              />
              <p className="text-red-500">{fields.description.errors}</p>
            </div>

            {/* Pricing and Stock Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-3">
                <Label>Price</Label>
                <Input
                  key={fields.price.key}
                  name={fields.price.name}
                  defaultValue={fields.price.initialValue}
                  type="number"
                  placeholder="R55"
                />
                <p className="text-red-500">{fields.price.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Discount Price</Label>
                <Input
                  type="number"
                  name={fields.discountPrice.name}
                  defaultValue={fields.discountPrice.initialValue}
                  placeholder="R40"
                  onChange={(e) => setDiscountPrice(Number(e.target.value))}
                  disabled={!isSale}
                  required={isSale}
                />
                <p className="text-red-500">{fields.discountPrice.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Quantity</Label>
                <Input
                  key={fields.quantity?.key}
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue="0"
                  placeholder="Available stock quantity"
                />
                <p className="text-red-500">{fields.quantity?.errors}</p>
              </div>
            </div>

            {/* Sale Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="isSale">On Sale</Label>
                  <p className="text-sm text-muted-foreground">
                    Mark this product as on sale.
                  </p>
                </div>
                <Switch
                  id="isSale"
                  checked={isSale}
                  onCheckedChange={setIsSale}
                />
                <input type="hidden" name={fields.isSale.name} value={String(isSale)} />
                <p className="text-red-500">{fields.isSale.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label htmlFor="saleEndDate">Sale End Date</Label>
                <DateTimePicker
                  id="saleEndDate"
                  name={fields.saleEndDate.name}
                  value={saleEndDate}
                  onChange={setSaleEndDate}
                  required={isSale}
                  className="w-full"
                />
                <p className="text-red-500">{fields.saleEndDate.errors}</p>
              </div>
            </div>

            {/* Category and Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label>Category</Label>
                <Select
                  key={fields.category.key}
                  name={fields.category.name}
                  defaultValue={fields.category.initialValue as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="kids">Kids</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="jewellery">Jewellery</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="brands">Brands</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-red-500">{fields.category.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Status</Label>
                <Select
                  key={fields.status.key}
                  name={fields.status.name}
                  defaultValue={fields.status.initialValue as string}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-red-500">{fields.status.errors}</p>
              </div>
            </div>

            {/* Featured Product Toggle */}
            <div className="flex items-center gap-3">
              <Label>Featured Product</Label>
              <Switch
                key={fields.isFeatured.key}
                name={fields.isFeatured.name}
                defaultChecked={Boolean(fields.isFeatured.initialValue)}
              />
              <p className="text-red-500">{fields.isFeatured.errors}</p>
            </div>

            {/* Sizes and Colors Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label>Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedSizes.map((size) => (
                    <div
                      key={size}
                      className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                    >
                      <span>{size}</span>
                      <button
                        type="button"
                        onClick={() => removeSize(size)}
                        className="text-secondary-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    placeholder="Add size"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSize}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Size
                  </Button>
                </div>
              </div>

              {/* Colors Section */}
              <div className="flex flex-col gap-3">
                <Label>Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedColors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                    >
                      <div 
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ 
                          backgroundColor: color.toLowerCase(),
                          boxShadow: color.toLowerCase() === 'white' ? 'inset 0 0 0 1px #ddd' : 'none'
                        }}
                      />
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => removeColor(color)}
                        className="text-secondary-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    placeholder="Add color"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddColor}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Color
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="flex flex-col gap-3">
              <Label>Product Images</Label>
              <UploadDropzone
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setImages([...images, ...res.map((r) => r.url)]);
                  toast.success("Images uploaded successfully!");
                }}
                onUploadError={(error: Error) => {
                  toast.error("Something went wrong during upload");
                  console.error(error);
                }}
              />
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        width={200}
                        height={200}
                        className="rounded-lg object-cover w-full h-[200px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-6">
          <CreationSubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
