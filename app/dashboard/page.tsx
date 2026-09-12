import { createServerSupabaseClient } from "@wheewise/supabase/server";
import { requireRole } from "@wheewise/rbac";
import { VerifiedBadgeIcon } from "@wheewise/ui";
import { InviteDealerForm } from "./InviteDealerForm";
import { PhoneVerification } from "./PhoneVerification";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { userId } = await requireRole(supabase, "ASSOCIATE");

  const { data: association } = await supabase
    .from("associations")
    .select("id, name")
    .eq("president_id", userId)
    .single();

  if (!association) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-zinc-500">
          No association is linked to this account yet. Contact Wheewise to get set up.
        </p>
      </div>
    );
  }

  const { data: dealers } = await supabase
    .from("dealers")
    .select("id, business_name, city, status")
    .eq("association_id", association.id)
    .order("business_name");

  // Deliberately no revenue/money figures here — vehicle-sold count only,
  // per the association role's spec (read-only oversight, not financials).
  const dealersWithCounts = await Promise.all(
    (dealers ?? []).map(async (dealer) => {
      const { count } = await supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("dealer_id", dealer.id)
        .eq("status", "SOLD");
      return { ...dealer, soldCount: count ?? 0 };
    }),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {!user?.phone && profile?.phone ? <PhoneVerification phone={profile.phone} /> : null}

      <h1 className="text-xl font-semibold">{association.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">{dealersWithCounts.length} registered dealers</p>

      <div className="mt-6 rounded-lg border border-border-default p-4">
        <p className="mb-2 text-sm font-medium">Invite a dealer</p>
        <InviteDealerForm />
      </div>

      <div className="mt-6 divide-y divide-border-default rounded-lg border border-border-default">
        {dealersWithCounts.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="flex items-center gap-1.5 font-medium">
                {d.status === "ACTIVE" ? (
                  <VerifiedBadgeIcon className="h-4 w-4 text-success" />
                ) : null}
                {d.business_name}
              </div>
              <div className="text-xs text-zinc-500">{d.city}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">{d.soldCount}</div>
              <div className="text-xs text-zinc-500">vehicles sold</div>
            </div>
          </div>
        ))}
        {dealersWithCounts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-zinc-500">No dealers under this association yet.</p>
        ) : null}
      </div>
    </div>
  );
}
