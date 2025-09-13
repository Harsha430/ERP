import { LoginForm } from '@/components/auth/LoginForm';

export default function FinanceLogin() {
  return (
    <LoginForm
      role="finance"
      title="Finance Portal"
      description="Access your Finance dashboard to manage accounts, transactions, and budgets."
    />
  );
}