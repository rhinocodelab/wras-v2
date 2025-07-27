import { getSession } from '@/app/actions';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { RailwayIcon } from '@/components/icons';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <Card className="grid md:grid-cols-2 shadow-2xl overflow-hidden rounded-2xl border-2 border-border">
          <div className="relative hidden md:flex flex-col justify-between bg-primary p-12 text-white">
            <div className="flex items-center gap-3">
               <RailwayIcon className="h-8 w-8 text-primary-foreground" />
              <span className="text-2xl font-bold font-headline">Railway Sign-In</span>
            </div>
            <div className='z-10'>
              <h2 className="text-4xl font-bold font-headline">
                Your journey to seamless access starts here.
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Reliable, secure, and always on time. Access your dashboard with confidence.
              </p>
            </div>
            <div className="z-10 text-xs text-primary-foreground/60">
              © {new Date().getFullYear()} Railway Corp.
            </div>
            <div className="absolute inset-0">
              <Image
                src="https://placehold.co/800x1200.png"
                alt="Abstract railway background"
                data-ai-hint="abstract railway tracks"
                fill
                className="object-cover opacity-10"
              />
            </div>
          </div>
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
