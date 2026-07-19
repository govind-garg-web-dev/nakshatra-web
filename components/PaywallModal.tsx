"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { PRODUCTS, type ProductId } from "@/lib/payments/products";

export function PaywallModal({
  open,
  onClose,
  productIds,
  title = "Continue with Nakshatra",
}: {
  open: boolean;
  onClose: () => void;
  productIds: ProductId[];
  title?: string;
}) {
  const [loadingId, setLoadingId] = useState<ProductId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(productId: ProductId) {
    setLoadingId(productId);
    setError(null);
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");
      // eslint-disable-next-line react-hooks/immutability -- intentional external redirect, not React state
      window.location.href = data.shortUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingId(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink/60">
          Flat pricing, no subscription, no auto-renewal. Pay once via UPI or card.
        </p>
        {productIds.map((id) => {
          const product = PRODUCTS[id];
          return (
            <div
              key={id}
              className="flex items-center justify-between rounded-xl border border-black/10 p-4"
            >
              <div>
                <p className="font-medium text-ink">{product.label}</p>
                <p className="text-sm text-ink/50">{product.description}</p>
              </div>
              <Button size="sm" onClick={() => buy(id)} disabled={loadingId === id}>
                {loadingId === id ? <Spinner /> : `₹${product.amountPaise / 100}`}
              </Button>
            </div>
          );
        })}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
