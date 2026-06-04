import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import { canAccess, type AccessKey } from "@/lib/roleAccess";

export interface NavAccess {
  canViewHome: boolean;
  canViewDashboard: boolean;
  canViewInvestor: boolean;
  canViewPricing: boolean;
  canViewSettings: boolean;
  canCreatePitch: boolean;
  canLikePitch: boolean;
  canComment: boolean;
  canAccessDealFlow: boolean;
  check: (key: AccessKey) => boolean;
}

export function useNavAccess(): NavAccess {
  const { userProfile } = useAuth();
  const { tier } = useBilling();

  const role = userProfile?.role ?? "viewer";
  const check = (key: AccessKey) => canAccess(key, role, tier);

  return {
    canViewHome: true,
    canViewDashboard: check("dashboard"),
    canViewInvestor: check("investorDashboard"),
    canViewPricing: true,
    canViewSettings: !!userProfile,
    canCreatePitch: check("createPitch"),
    canLikePitch: check("likePitch"),
    canComment: check("comment"),
    canAccessDealFlow: check("dealFlow"),
    check,
  };
}
