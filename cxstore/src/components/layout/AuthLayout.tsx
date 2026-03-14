import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_var(--muted),_transparent_36%),linear-gradient(180deg,_var(--background),_var(--muted))] px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}
