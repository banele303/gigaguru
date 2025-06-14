"use client";

import { Suspense } from "react";
import { HomeCategories } from "../components/storefront/HomeCategories";
import FeaturedProducts from "../components/storefront/FeaturedProducts";
import { Hero } from "../components/storefront/Hero";

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-[600px] bg-gray-200 mb-8" />
      <div className="h-32 bg-gray-200 mb-8" />
      <div className="h-96 bg-gray-200" />
    </div>
  );
}

export default function IndexPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <div>
        <Hero />
        <HomeCategories />
        <FeaturedProducts />
      </div>
    </Suspense>
  );
}
