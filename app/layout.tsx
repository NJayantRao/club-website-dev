import Layout from "@/components/Layout";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import QueryProvider from "@/context/QueryProvider";

export const metadata = {
  title: "Club Excel",
  description: "Official Website of Club Excel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
