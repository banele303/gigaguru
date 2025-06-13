"use client";

import { HomeCategories } from "../components/storefront/HomeCategories";
import FeaturedProducts from "../components/storefront/FeaturedProducts";
import { Hero } from "../components/storefront/Hero";
import { Navbar } from "../components/storefront/Navbar";

export default function IndexPage() {
  return (
    <div>
      <Hero />
      <HomeCategories />
      <FeaturedProducts />
    </div>
  );
}
