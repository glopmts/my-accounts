import Header from "@/components/Header";
import { SessionWrapper } from "@/components/SessionWrapper";
import { SessionProvider } from "@/context/SessionContext";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SessionWrapper>
        <section className="min-h-screen flex-1 w-full h-full">
          <Header />
          <main className=" w-full px-4 py-8">{children}</main>
        </section>
      </SessionWrapper>
    </SessionProvider>
  );
}
