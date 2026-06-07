import { redirect } from "next/navigation";
import { hasOperatorSession } from "@/lib/server/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const authenticated = await hasOperatorSession();
  const params = await searchParams;
  const nextPath = params.next ?? "/operator";

  if (authenticated) {
    redirect(nextPath);
  }

  return (
    <div className="container-page flex min-h-screen items-center justify-center">
      <LoginForm nextPath={nextPath} error={params.error} />
    </div>
  );
}
