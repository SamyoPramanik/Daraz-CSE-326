import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Orders | Daraz",
    description: "View your orders on Daraz",
};

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
