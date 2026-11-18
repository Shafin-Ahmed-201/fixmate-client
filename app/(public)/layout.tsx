import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/** Marketing shell: sticky navbar + footer around all public pages. */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
