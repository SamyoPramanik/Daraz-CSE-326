import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register | Daraz",
    description: "Create a new Daraz account",
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
