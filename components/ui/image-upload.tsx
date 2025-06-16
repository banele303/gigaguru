"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onChange: (value: string) => void;
  value: string;
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  onChange,
  value,
  disabled,
  className
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle component mount
  useState(() => {
    setIsMounted(true);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          onChange(result);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    disabled,
    maxFiles: 1
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "w-full p-4 flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition",
          isDragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {value ? (
          <div className="relative w-full aspect-video">
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-500">
              {isDragActive
                ? "Drop the image here"
                : "Drag & drop an image, or click to select"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 