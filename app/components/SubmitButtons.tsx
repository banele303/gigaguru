"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { useFormStatus } from "react-dom";

interface buttonProps {
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

export function SubmitButton({ text, variant }: buttonProps) {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      variant={variant} 
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please Wait
        </>
      ) : (
        text
      )}
    </Button>
  );
}

export function CreationSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Creating...</span>
        </>
      ) : (
        "Create"
      )}
    </Button>
  );
}

export function ShoppingBagButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      size="lg" 
      className="w-full mt-5" 
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-4 h-5 w-5 animate-spin" /> 
          Please Wait
        </>
      ) : (
        <>
          <ShoppingBag className="mr-4 h-5 w-5" /> 
          Add to Cart
        </>
      )}
    </Button>
  );
}

export function DeleteItem() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      className="font-medium text-primary text-end"
      disabled={pending}
    >
      {pending ? "Removing..." : "Delete"}
    </button>
  );
}

export function ChceckoutButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      size="lg" 
      className="w-full mt-5"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
          Please Wait
        </>
      ) : (
        "Checkout"
      )}
    </Button>
  );
}
