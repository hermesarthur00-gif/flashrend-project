import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/primitives";

export default function OnboardingLayout({ children }: LayoutProps<"/account">) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
    </div>
  );
}
