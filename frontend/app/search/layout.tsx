import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search | Daraz",
    description: "Search for products on Daraz",
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
