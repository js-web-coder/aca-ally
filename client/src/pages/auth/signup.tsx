import { Container } from '@/components/layout/container';
import { UserAuthForm } from '@/components/ui/user-auth-form';

export default function Signup() {
  return (
    <Container>
      <div className="max-w-md mx-auto py-10">
        <UserAuthForm type="signup" />
      </div>
    </Container>
  );
}
