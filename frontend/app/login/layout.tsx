import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Daraz",
    description: "Login to your Daraz account",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
