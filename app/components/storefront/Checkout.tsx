import { useEffect } from "react";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import { useCart } from "@/app/hooks/useCart";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { trackCheckoutStart, trackCheckoutComplete } = useAnalytics();
  const { items, total } = useCart();
  const { user } = useKindeBrowserClient();
  const router = useRouter();

  useEffect(() => {
    if (items.length > 0) {
      trackCheckoutStart();
    }
  }, [items.length, trackCheckoutStart]);

  const processCheckout = async () => {
    if (!user) {
      throw new Error("User must be logged in to checkout");
    }

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        items,
        total,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to process checkout");
    }

    const data = await response.json();
    return data;
  };

  const handleCheckoutComplete = async () => {
    try {
      const result = await processCheckout();
      trackCheckoutComplete();
      // Redirect to success page or show success message
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (error) {
      console.error("Error during checkout:", error);
      // Handle error (show error message to user)
      if (error instanceof Error) {
        // You might want to show this error in your UI
        console.error(error.message);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between items-center font-bold">
              <p>Total</p>
              <p>${(total / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleCheckoutComplete}
          className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors"
          disabled={items.length === 0}
        >
          Complete Purchase
        </button>
      </div>
    </div>
  );
} 