import { LoginForm } from '@/components/auth/LoginForm';

export default function HRLogin() {
  return (
    <LoginForm
      role="hr"
      title="HR Portal"
      description="Access your Human Resources dashboard to manage employees, attendance, and payroll."
    />
  );
}