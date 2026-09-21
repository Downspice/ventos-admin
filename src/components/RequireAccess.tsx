import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { RequireAccessSkeleton } from "@/components/loading-skeletons";
import { useAccess } from "../hooks/useAccess";

type Props = {
  permission?: string;
  children: ReactNode;
};

export function RequireAccess({ permission, children }: Props) {
  const { loading, can, user } = useAccess();

  if (loading) return <RequireAccessSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !can(permission)) {
    return <p className="text-sm text-red-500">You do not have access to this area.</p>;
  }

  return children;
}
