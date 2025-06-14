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
import { ChevronLeft, XIcon } from "lucide-react";
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
import { SubmitButton } from "@/app/components/SubmitButtons";
import { Plus, X, Tag, Ruler, Palette } from "lucide-react";
import { logFormSubmission } from "@/app/lib/debug";



export default function ProductCreateRoute() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState<string>("");
  const [colorInput, setColorInput] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

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

  const initialState = undefined;
  const [lastResult, action] = useFormState(createProduct, initialState);
  const router = useRouter();

  useEffect(() => {
    if (lastResult && "message" in lastResult) {
      if (lastResult.status === "success") {
        toast.success(lastResult.message);
        router.push("/dashboard/products");
      } else if (lastResult.status === "error") {
        toast.error(lastResult.message);
      }
    }
  }, [lastResult, router]);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      console.log("Form validation started");
      const result = parseWithZod(formData, { schema: createProductSchema });
      console.log("Validation result:", result);
      return result;
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleDelete = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <form 
      id={form.id} 
      action={async (formData: FormData) => {
        console.log("Form action started");
        console.log("Form data:", Object.fromEntries(formData.entries()));
        console.log("Images:", images);
        
        // Add images to formData
        images.forEach((image, index) => {
          formData.append("images", image);
        });
        
        // Add sizes to formData
        selectedSizes.forEach((size) => {
          formData.append("sizes", size);
        });
        
        // Add colors to formData
        selectedColors.forEach((color) => {
          formData.append("colors", color);
        });
        
        const result = await createProduct(null, formData);
        console.log("Form submission result:", result);
        
        if (result.status === "success") {
          toast.success(result.message);
          router.push("/dashboard/products");
        } else {
          toast.error(result.message);
        }
      }}
    >
      {/* Hidden inputs for form data */}
      {images.map((image, index) => (
        <input type="hidden" name="images" key={`image-${index}`} value={image} />
      ))}
      {selectedSizes.map((size) => (
        <input type="hidden" name="sizes" key={`size-${size}`} value={size} />
      ))}
      {selectedColors.map((color) => (
        <input type="hidden" name="colors" key={`color-${color}`} value={color} />
      ))}
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild className="rounded-full shadow-sm hover:shadow-md transition-shadow">
          <Link href="/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">New Product</h1>
      </div>

      <Card className="mt-5 shadow-md border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-xl">Product Details</CardTitle>
          <CardDescription>
            Create a new product with all details
          </CardDescription>
        </CardHeader>
        <CardContent>
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

              <div className="flex flex-col gap-3">
                <Label>Brand</Label>
                <Input
                  type="text"
                  name="brand"
                  className="w-full"
                  placeholder="Enter brand name"
                />
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
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter a size"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="button" onClick={handleAddSize}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSizes.map((size) => (
                    <div key={size} className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1 text-sm">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="text-gray-500 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-red-500">{fields.sizes?.errors}</p>
              </div>

              <div className="flex flex-col gap-3">
                <Label>Colors</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter a color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="button" onClick={handleAddColor}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedColors.map((color) => (
                    <div key={color} className="flex items-center gap-1 bg-gray-200 rounded-full px-2 py-1 text-sm">
                      <div 
                        className="h-3 w-3 rounded-full mr-1" 
                        style={{ 
                          backgroundColor: color.toLowerCase(), 
                          border: color.toLowerCase() === 'white' ? '1px solid #ddd' : 'none' 
                        }} 
                      />
                      {color}
                      <button 
                        type="button" 
                        onClick={() => removeColor(color)} 
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-red-500">{fields.colors?.errors}</p>
              </div>
            </div>

            {/* Images Section */}
            <div className="flex flex-col gap-3">
              <Label>Images</Label>
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        fill
                        src={image}
                        alt="Product Image"
                        className="object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDelete(index)}
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition-colors"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <UploadDropzone
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setImages(res.map((r) => r.url));
                  }}
                  onUploadError={() => {
                    toast.error("Failed to upload image");
                  }}
                />
              )}
              <p className="text-red-500">{fields.images.errors}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-4">
          <SubmitButton text="Create Product" />
        </CardFooter>
      </Card>
    </form>
  );
}
