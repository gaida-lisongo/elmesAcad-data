export default function CommandeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-2 pt-16 dark:bg-boxdark-2 lg:pt-20">
      {children}
    </div>
  );
}
