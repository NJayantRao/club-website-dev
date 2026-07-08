import Layout from "@/components/Layout";
import "./globals.css";

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
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
