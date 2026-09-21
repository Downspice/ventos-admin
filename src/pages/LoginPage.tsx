import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
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
    <div
      className="flex min-h-svh items-center justify-center px-4"
      style={{ background: "oklch(0.967 0.003 247)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold text-white"
            style={{ background: "oklch(0.568 0.185 142)" }}
          >
            V
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold" style={{ color: "oklch(0.2 0.01 260)" }}>
              Admin Portal
            </h1>
            <p className="mt-1 text-sm" style={{ color: "oklch(0.52 0.015 250)" }}>
              Sign in with your admin credentials.
            </p>
          </div>
        </div>

        <Card className="rounded bg-white p-2 shadow-sm ring-1 ring-foreground/10">
          <CardContent className="p-6">
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

              {error ? (
                <p
                  className="rounded px-3 py-2 text-sm"
                  style={{
                    background: "oklch(0.97 0.02 27)",
                    color: "oklch(0.55 0.22 27)",
                    border: "1px solid oklch(0.88 0.08 27)",
                  }}
                >
                  {error.message}
                </p>
              ) : null}

              <Button
                id="admin-login-submit"
                type="submit"
                disabled={loading}
                className="h-10 w-full text-sm font-medium"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
