export default function UniteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-2 pt-26 dark:bg-boxdark-2 lg:pt-20">
      {children}
    </div>
  );
}
