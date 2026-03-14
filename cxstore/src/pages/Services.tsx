import { Link } from "react-router-dom";

export default function Services() {
  const services = [
    { title: "E-Commerce Infrastructure", desc: "Scalable APIs and robust database schemas for modern shops." },
    { title: "Identity & Access", desc: "Secure authentication and role-based access control." },
    { title: "Inventory Management", desc: "Real-time stock tracking, categorization, and reporting." },
    { title: "Analytics & Monitoring", desc: "Comprehensive dashboards built with React and Shadcn." },
  ];

  return (
    <div className="container py-10 pl-6">
      <h1 className="text-4xl font-bold mb-6">Our Services</h1>
      <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
        We offer a suite of modular capabilities that can be utilized independently or as part of a fully integrated platform.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl">
        {services.map((s, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">{s.title}</h3>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10">
        <Link to="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          Sign In to Dashboard
        </Link>
      </div>
    </div>
  );
}
