import { getSession } from '@/app/actions';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { Card } from '@/components/ui/card';
import { RailwayIcon } from '@/components/icons';
import { Separator } from '@/components/ui/separator';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg overflow-hidden rounded-lg border">
          <div className="relative flex flex-col items-center justify-center text-center bg-primary p-12 text-white">
            <div className='mb-8 flex items-center justify-center h-20 w-20 rounded-full bg-white/20'>
              <RailwayIcon className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">WRAS-DHH</h2>
            <p className="mt-2 text-base text-primary-foreground/80">
              Western Railway Announcement System
              <br />
              for Deaf and Hard of Hearing
            </p>
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <LoginForm />
          </div>
        </Card>
      </div>
    </main>
  );
}
