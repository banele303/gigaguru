"use client";

import { createBanner } from "@/app/actions";
import { CreationSubmitButton } from "@/app/components/SubmitButtons";
import { UploadDropzone } from "@/app/lib/uplaodthing";
import { bannerSchema } from "@/app/lib/zodSchemas";
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
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const RECOMMENDED_IMAGE_DIMENSIONS = {
  width: 1920,
  height: 600,
};

export default function BannerRoute() {
  const router = useRouter();
  const [image, setImages] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, action] = useFormState(createBanner, undefined);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: bannerSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success('Banner created successfully');
      router.push("/dashboard/banner");
      router.refresh();
    } else if (lastResult?.status === 'error' && lastResult.error?._errors) {
      toast.error(lastResult.error._errors[0]);
    }
  }, [lastResult, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("imageString", image);

    try {
      await action(formData);
    } catch (error) {
      toast.error("Failed to create banner. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id={form.id} onSubmit={handleSubmit}>
      <div className="flex items-center gap-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/banner">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New Banner</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Banner Details</CardTitle>
          <CardDescription>
            Create your banner right here. Recommended image size: {RECOMMENDED_IMAGE_DIMENSIONS.width}x{RECOMMENDED_IMAGE_DIMENSIONS.height}px
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-3">
              <Label>Title</Label>
              <Input
                name="title"
                type="text"
                placeholder="Enter banner title"
                required
                disabled={isSubmitting}
                defaultValue={fields.title.initialValue}
              />
              {fields.title.errors && (
                <p className="text-sm text-red-500">{fields.title.errors}</p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Label>Image</Label>
              {image !== undefined ? (
                <div className="relative">
                <Image
                  src={image}
                    alt="Banner Image"
                    width={RECOMMENDED_IMAGE_DIMENSIONS.width}
                    height={RECOMMENDED_IMAGE_DIMENSIONS.height}
                    className="w-full h-[300px] object-cover border rounded-lg"
                />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImages(undefined)}
                    disabled={isSubmitting}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <UploadDropzone
                  onClientUploadComplete={(res) => {
                    setImages(res[0].url);
                    toast.success("Image uploaded successfully");
                  }}
                  onUploadError={(error) => {
                    toast.error("Failed to upload image");
                    console.error("Upload error:", error);
                  }}
                  endpoint="bannerImageRoute"
                  config={{
                    mode: "auto"
                  }}
                />
              )}
              {fields.imageString.errors && (
                <p className="text-sm text-red-500">{fields.imageString.errors}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <CreationSubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
