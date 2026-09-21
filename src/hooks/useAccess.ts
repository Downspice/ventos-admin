import { useQuery } from "@apollo/client/react";
import { MY_ACCESS } from "../lib/apollo";

type MyAccessData = {
  myAccess?: { permissions: string[] };
  me?: { id: string; email: string; name?: string | null; avatarUrl?: string | null };
  business?: { id: string; name: string };
};

export function useAccess() {
  const { data, loading, refetch } = useQuery<MyAccessData>(MY_ACCESS, {
    fetchPolicy: "cache-and-network",
  });

  const permissions = new Set(data?.myAccess?.permissions ?? []);

  return {
    loading,
    refetch,
    user: data?.me ?? null,
    business: data?.business ?? null,
    can: (permission: string) => permissions.has(permission),
  };
}
