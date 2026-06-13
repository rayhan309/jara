import AdminLoginForm from "@/components/auth/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Nexa",
  description: "Administrator login for Nexa E-Commerce dashboard",
};

export default function AdminLoginPage() {
  return (
    <div className="font-dashboard">
      <AdminLoginForm />
    </div>
  );
}
