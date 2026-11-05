import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/server/session";
import { getAllocation } from "@/lib/server/portfolio";
import { getHoldings } from "@/lib/server/portfolio";
import { ProfilePicker } from "./profile-picker";

export const metadata: Metadata = { title: "Votre profil" };

export default async function ProfilePage() {
  const user = await requireUser();
  if (user.kycStatus === "NONE") redirect("/account/verification");
  const [careful, balanced, bold, holdings] = await Promise.all([getAllocation("CAREFUL"), getAllocation("BALANCED"), getAllocation("BOLD"), user.profile ? getHoldings(user.id) : null]);
  return <ProfilePicker current={user.profile} allocations={{ CAREFUL: careful, BALANCED: balanced, BOLD: bold }} invested={(holdings?.total ?? 0) > 0} />;
}
