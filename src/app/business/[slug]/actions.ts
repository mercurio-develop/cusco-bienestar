"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function verifyBusinessAction(businessId: string, token: string) {
  if (!businessId || !token) {
    return { success: false, error: "Missing required parameters" };
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    if (business.verificationToken !== token) {
      return { success: false, error: "Invalid or expired verification token" };
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        verificationToken: null // One-time use
      }
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return { success: true };
  } catch (error) {
    console.error("Error verifying business:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function claimBusinessAction(
  businessId: string,
  formData: FormData
) {
  if (!businessId) {
    return { success: false, error: "Missing business ID" };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const qrCodeUrl = formData.get("qrCodeUrl") as string;

  if (!name || !email || !phone || !qrCodeUrl) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return { success: false, error: "Business not found" };
    }

    await prisma.business.update({
      where: { id: businessId },
      data: {
        isClaimed: true,
        qrCodeUrl,
        contactEmail: email,
        whatsapp: phone,
      }
    });

    ;(revalidateTag as (tag: string) => void)("businesses");
    return { success: true };
  } catch (error) {
    console.error("Error claiming business:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
