import Header from "@/components/Header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <section className="min-h-screen flex-1 w-full h-full">
      <Header />
      <main className=" w-full px-4 py-8">{children}</main>
    </section>
  );
}
