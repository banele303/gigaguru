import { ProductCardClient } from "./ProductCardClient";
import { Product } from "@/app/lib/zodSchemas";

interface iAppProps {
  item: Product;
}

export function ProductCard({ item }: iAppProps) {
  return <ProductCardClient item={item} />;
}
