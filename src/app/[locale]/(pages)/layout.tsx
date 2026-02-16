import Header from "@/components/Header";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen flex-1 w-full h-full">
      <Header />
      <main className=" w-full px-4 py-8">{children}</main>
    </section>
  );
}
