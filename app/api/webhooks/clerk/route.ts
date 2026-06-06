import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface ClerkEventData {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}
interface ClerkEvent {
  type: string;
  data: ClerkEventData;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (webhookSecret) {
      const h = await headers();
      const svixId = h.get("svix-id");
      const svixTs = h.get("svix-timestamp");
      const svixSig = h.get("svix-signature");

      if (svixId && svixTs && svixSig) {
        try {
          const { Webhook } = await import("svix");
          new Webhook(webhookSecret).verify(rawBody, {
            "svix-id": svixId,
            "svix-timestamp": svixTs,
            "svix-signature": svixSig,
          });
        } catch {
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }
    }

    const event: ClerkEvent = JSON.parse(rawBody);
    const { type, data } = event;

    if (type === "user.created") {
      await db
        .insert(users)
        .values({
          id: data.id,
          email: data.email_addresses[0]?.email_address ?? "",
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        })
        .onConflictDoNothing();
    }

    if (type === "user.updated") {
      await db
        .update(users)
        .set({
          email: data.email_addresses[0]?.email_address ?? "",
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          updatedAt: new Date(),
        })
        .where(eq(users.id, data.id));
    }

    if (type === "user.deleted") {
      await db.delete(users).where(eq(users.id, data.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Clerk Webhook]", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
