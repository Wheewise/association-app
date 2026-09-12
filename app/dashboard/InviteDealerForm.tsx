"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, Input } from "@wheewise/ui";
import { inviteDealer, type InviteDealerState } from "./actions";

export function InviteDealerForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<InviteDealerState | undefined, FormData>(
    inviteDealer,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
      <div className="min-w-0 flex-1">
        <Input
          name="email"
          type="email"
          placeholder="dealer@business.com"
          required
          className="max-w-sm"
        />
        {state && !state.ok ? <p className="mt-1 text-xs text-danger">{state.error}</p> : null}
        {state?.ok ? (
          <p className="mt-1 text-xs text-success">
            Invited — they&apos;ll be linked to your association once they sign up with this email.
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Inviting…" : "Invite dealer"}
      </Button>
    </form>
  );
}
