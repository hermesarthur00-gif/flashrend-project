export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in flex flex-col gap-6">{children}</div>;
}
