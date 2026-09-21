const ACCESS = "ventos_admin_access";
const REFRESH = "ventos_admin_refresh";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS, accessToken);
  localStorage.setItem(REFRESH, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
}

export function captureTokensFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refresh = params.get("refreshToken");
  if (token) {
    setTokens(token, refresh ?? "");
    params.delete("token");
    params.delete("refreshToken");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
    return true;
  }
  return false;
}
