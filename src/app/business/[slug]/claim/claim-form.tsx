"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { claimBusinessAction } from "../actions";
import { Button } from "@/components/ui/button";

export function ClaimForm({ businessId, slug }: { businessId: string, slug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await claimBusinessAction(businessId, formData);

    setIsSubmitting(false);

    if (result.success) {
      router.push(`/business/${slug}`);
      router.refresh();
    } else {
      setError(result.error || "An error occurred.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required 
          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
        <input 
          type="tel" 
          id="phone" 
          name="phone" 
          required 
          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
        />
      </div>

      <div>
        <label htmlFor="qrCodeUrl" className="block text-sm font-medium text-slate-700 mb-1">Yape QR Code URL</label>
        <p className="text-xs text-slate-500 mb-2">Provide a link to an image of your Yape QR code. This replaces the checkout fee.</p>
        <input 
          type="url" 
          id="qrCodeUrl" 
          name="qrCodeUrl" 
          required 
          placeholder="https://example.com/my-yape-qr.png"
          className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" 
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 mt-4"
      >
        {isSubmitting ? "Claiming..." : "Claim Business for Free"}
      </Button>
    </form>
  );
}
