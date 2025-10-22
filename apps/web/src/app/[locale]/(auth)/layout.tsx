/**
 * Auth layout - for login/register pages
 * Simple centered layout with Farmy branding
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-700">🐑 Farmy</h1>
          <p className="text-gray-600 mt-2">Farm Management System</p>
        </div>

        {/* Auth form card */}
        <div className="card">{children}</div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>&copy; 2024 Farmy. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

