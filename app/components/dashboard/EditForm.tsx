"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon, Plus, X, Ruler, Palette } from "lucide-react";
import Link from "next/link";
import {  SubmitButton } from "../SubmitButtons";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { UploadDropzone } from "@/app/lib/uplaodthing";
import { categories } from "@/app/lib/categories";
import { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { addReview, editProduct } from "@/app/actions";
import { useForm } from "@conform-to/react";
import { useFormStatus } from "react-dom";
import { parseWithZod } from "@conform-to/zod";
import { productSchema } from "@/app/lib/zodSchemas";
import { type Category, type ProductStatus, type CampaignStatus, type RecipientStatus } from "@/app/lib/prisma-types";

// Define the Review type locally
type Review = {
  id: string;
  rating: number;
  comment: string;
  user: {
    firstName: string | null;
    profileImage: string | null;
  };
};

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Gray",
  "Brown",
];

interface iAppProps {
  data: {
    id: string;
    name: string;
    description: string;
    status: ProductStatus;
    price: number;
    images: string[];
    category: Category;
    isFeatured: boolean;
    sizes: string[];
    colors: string[];
    sku: string;
    reviews: (Review & {
      user: {
        firstName: string | null;
        profileImage: string | null;
      };
    })[];
    quantity: number;
  };
}

export function EditForm({ data }: iAppProps) {
  const [images, setImages] = useState<string[]>(data.images);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(data.sizes || []);
  const [selectedColors, setSelectedColors] = useState<string[]>(data.colors || []);
  const [customSize, setCustomSize] = useState<string>("");
  const [customColor, setCustomColor] = useState<string>("");
  const sizesRef = useRef<HTMLSelectElement>(null);
  const colorsRef = useRef<HTMLSelectElement>(null);

  const handleCustomSizeAdd = () => {
    if (customSize && !selectedSizes.includes(customSize)) {
      setSelectedSizes([...selectedSizes, customSize]);
      setCustomSize(""); // Clear input after adding
    }
  };

  const handleCustomColorAdd = () => {
    if (customColor && !selectedColors.includes(customColor)) {
      setSelectedColors([...selectedColors, customColor]);
      setCustomColor(""); // Clear input after adding
    }
  };

  const removeSize = (size: string) => {
    setSelectedSizes(selectedSizes.filter((s) => s !== size));
  };

  const removeColor = (color: string) => {
    setSelectedColors(selectedColors.filter((c) => c !== color));
  };
  const [lastResult, action] = useFormState(editProduct, undefined);
  const [reviewState, reviewAction] = useFormState(addReview, undefined);

  useEffect(() => {
    if (reviewState && "message" in reviewState) {
      alert(reviewState.message);
    }
  }, [reviewState]);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleDelete = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  return (
    <div>
      <form id={form.id} onSubmit={form.onSubmit} action={action}>
        <input type="hidden" name="productId" value={data.id} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/products">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">
              Edit Product
            </h1>
          </div>
          <SubmitButton text="Save Changes" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Update your product details here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      key={fields.name.key}
                      name={fields.name.name}
                      defaultValue={data.name}
                      className="w-full"
                      placeholder="Product Name"
                    />
                    <p className="text-red-500">{fields.name.errors}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Label>Description</Label>
                    <Textarea
                      key={fields.description.key}
                      name={fields.description.name}
                      defaultValue={data.description}
                      placeholder="Write your description right here..."
                    />
                    <p className="text-red-500">{fields.description.errors}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-3">
                      <Label>Price</Label>
                      <Input
                        key={fields.price.key}
                        name={fields.price.name}
                        defaultValue={data.price}
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
                        defaultValue={(data as any).quantity || 0}
                        placeholder="Available stock quantity"
                      />
                      <p className="text-red-500">{fields.quantity?.errors}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Label>SKU</Label>
                    <Input
                      key={fields.sku.key}
                      name={fields.sku.name}
                      defaultValue={data.sku}
                      placeholder="Product SKU"
                    />
                    <p className="text-red-500">{fields.sku.errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <input
                    type="hidden"
                    value={images}
                    key={fields.images.key}
                    name={fields.images.name}
                    defaultValue={fields.images.initialValue as any}
                  />
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative w-full h-24">
                          <Image
                            fill
                            src={image}
                            alt="Product Image"
                            className="w-full h-full object-cover rounded-lg border"
                          />
                          <button
                            onClick={() => handleDelete(index)}
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-lg text-white"
                          >
                            <XIcon className="w-3 h-3" />
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
                        alert("Something went wrong");
                      }}
                    />
                  )}
                  <p className="text-red-500">{fields.images.errors}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label>Status</Label>
                  <Select
                    key={fields.status.key}
                    name={fields.status.name}
                    defaultValue={data.status}
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
                <div className="flex flex-col gap-3">
                  <Label>Category</Label>
                  <Select
                    key={fields.category.key}
                    name={fields.category.name}
                    defaultValue={data.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-red-500">{fields.category.errors}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Label>Featured Product</Label>
                  <Switch
                    key={fields.isFeatured.key}
                    name={fields.isFeatured.name}
                    defaultChecked={data.isFeatured}
                  />
                  <p className="text-red-500">{fields.isFeatured.errors}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sizes & Colors</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <Label>Sizes</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (value && !selectedSizes.includes(value))
                          setSelectedSizes([...selectedSizes, value]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add custom size"
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleCustomSizeAdd}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedSizes.map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {selectedSizes.map((size) => (
                    <input type="hidden" name="sizes" key={size} value={size} />
                  ))}
                  <p className="text-red-500">{fields.sizes?.errors}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <Label>Colors</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(value) => {
                        if (value && !selectedColors.includes(value))
                          setSelectedColors([...selectedColors, value]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add custom color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleCustomColorAdd}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedColors.map((color) => (
                      <div
                        key={color}
                        className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors px-3 py-1 rounded-full text-sm"
                      >
                        <div
                          className="h-3 w-3 rounded-full mr-1"
                          style={{
                            backgroundColor: color.toLowerCase(),
                            border:
                              color.toLowerCase() === "white"
                                ? "1px solid #ddd"
                                : "none",
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
                  {selectedColors.map((color) => (
                    <input
                      type="hidden"
                      name="colors"
                      key={color}
                      value={color}
                    />
                  ))}
                  <p className="text-red-500">{fields.colors?.errors}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Add a Review</CardTitle>
              <CardDescription>
                Share your thoughts on this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewForm productId={data.id} />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Product Reviews</CardTitle>
              <CardDescription>
                See what others are saying about this product.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-6">
              {data.reviews.map((review) => (
                <div key={review.id} className="flex gap-x-4">
                  <Image
                    src={review.user.profileImage as string}
                    alt="User Profile Image"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <h3 className="font-semibold">{review.user.firstName}</h3>
                    <div className="flex gap-x-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <svg
                          key={index}
                          className={`w-4 h-4 ${
                            index < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useFormState(addReview, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "message" in state && state.message) {
      alert(state.message);
      if (state.status === "success") {
        formRef.current?.reset();
      }
    }
  }, [state]);

  return (
    <form action={action} ref={formRef}>
      <input type="hidden" name="productId" value={productId} />
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-2">
          <Label>Rating</Label>
          <Select name="rating">
            <SelectTrigger>
              <SelectValue placeholder="Select a rating" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={String(rating)}>
                  {rating} star{rating > 1 && "s"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <Label>Comment</Label>
          <Textarea name="comment" placeholder="Write your review here..." />
        </div>
        <SubmitButton text="Submit Review" />
      </div>
    </form>
  );
}
