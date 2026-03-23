// Protected layout — the shell every admin page lives inside.
// Structure: AuthProvider → AdminSidebar + [AdminHeader + content]
// AuthProvider gates render until stores are hydrated.
// AdminSidebar and AdminHeader are rendered once here —
// individual pages only render their content.
import { AuthProvider } from '@/components/shell/AuthProvider';
import { AdminSidebar } from '@/components/shell/AdminSidebar';
import { AdminHeader } from '@/components/shell/AdminHeader';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="admin-shell">
                {/* Fixed left sidebar */}
                <AdminSidebar />

                {/* Right side: header + scrollable content */}
                <div className="admin-content-wrap">
                    <AdminHeader />
                    <main className="admin-main" id="main-content">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}