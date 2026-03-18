"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Star, LogOut } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navLinks = [
        { label: "My Orders", href: "/profile/orders", icon: Package },
        { label: "My Reviews", href: "/profile/reviews", icon: Star },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Left Sidebar */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
                        <div className="mb-6 px-4 pt-2">
                            <h2 className="text-xl font-bold text-gray-900">Hello, John Doe</h2>
                            <p className="text-sm text-gray-500">john@example.com</p>
                        </div>

                        <nav className="space-y-1">
                            {navLinks.map(link => {
                                const Icon = link.icon;
                                const isActive = pathname.startsWith(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-orange-50 text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-8 pt-4 border-t px-4">
                            <button className="flex items-center gap-3 text-red-500 hover:text-red-600 font-medium transition-colors w-full text-left py-2">
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content Pane */}
                <div className="flex-1">
                    {children}
                </div>

            </div>
        </div>
    );
}
