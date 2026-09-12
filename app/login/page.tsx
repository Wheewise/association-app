import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="rounded-xl border border-border-default bg-background p-6 shadow-sm sm:p-8">
        <h1 className="mb-6 text-center text-xl font-semibold">Association sign in</h1>
        <LoginForm />
      </div>
      <p className="mt-6 text-center text-xs text-zinc-500">
        Association accounts are set up directly by Wheewise — there's no self-signup here.
      </p>
    </div>
  );
}
