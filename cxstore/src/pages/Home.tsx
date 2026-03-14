import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="container py-10 pl-6">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Welcome to CXStore</h1>
      <p className="text-xl text-muted-foreground max-w-[700px]">
        A comprehensive and scalable solution powered by Codexsun infrastructure.
        Manage your services dynamically and see everything connect seamlessly.
      </p>
      <div className="flex gap-4 mt-8">
        <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          Get Started
        </Link>
      </div>
    </div>
  );
}
