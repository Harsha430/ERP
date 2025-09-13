import { LoginForm } from '@/components/auth/LoginForm';

export default function AdminLogin() {
  return (
    <LoginForm
      role="admin"
      title="Admin Portal"
      description="Access the complete ERP system with full administrative privileges."
    />
  );
}