export default function PlatformTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-transition-enter h-full">{children}</div>;
}
