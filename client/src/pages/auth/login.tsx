import { Container } from '@/components/layout/container';
import { UserAuthForm } from '@/components/ui/user-auth-form';

export default function Login() {
  return (
    <Container>
      <div className="max-w-md mx-auto py-10">
        <UserAuthForm type="signin" />
      </div>
    </Container>
  );
}
