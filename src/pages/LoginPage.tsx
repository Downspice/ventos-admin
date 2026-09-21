import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AuthError, AuthLayout } from "@/components/AuthLayout";
import { LOGIN } from "../lib/apollo";
import { setTokens } from "../lib/auth-storage";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data } = await login({ variables: { input: { email, password } } });
    const payload = (data as { login?: { accessToken: string; refreshToken: string } })?.login;
    if (payload?.accessToken) {
      setTokens(payload.accessToken, payload.refreshToken);
      navigate("/");
    }
  }

  return (
    <AuthLayout
      variant="admin"
      title="Admin portal"
      description="Sign in with your admin credentials."
    >
      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="grid gap-1.5">
          <Label htmlFor="admin-login-email">Email address</Label>
          <Input
            id="admin-login-email"
            className="h-10"
            type="email"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="admin-login-password">Password</Label>
          <PasswordInput
            id="admin-login-password"
            className="h-10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <AuthError message={error.message} /> : null}

        <Button
          id="admin-login-submit"
          type="submit"
          disabled={loading}
          className="h-10 w-full text-sm font-medium"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
