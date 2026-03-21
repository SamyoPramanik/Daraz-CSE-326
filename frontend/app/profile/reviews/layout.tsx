import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Reviews | Daraz",
    description: "View and manage your reviews on Daraz",
};

export default function ReviewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
