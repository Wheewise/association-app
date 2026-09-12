"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@wheewise/supabase/server";
import { requireRole } from "@wheewise/rbac";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export type InviteDealerState =
  | { ok: true }
  | { ok: false; error: string };

export async function inviteDealer(
  _prev: InviteDealerState | undefined,
  formData: FormData,
): Promise<InviteDealerState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { userId } = await requireRole(supabase, "ASSOCIATE");

  const { data: association } = await supabase
    .from("associations")
    .select("id")
    .eq("president_id", userId)
    .single();
  if (!association) {
    return { ok: false, error: "No association is linked to this account." };
  }

  const { error } = await supabase
    .from("dealer_invites")
    .insert({ email: parsed.data.email, association_id: association.id });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "This email has already been invited." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
