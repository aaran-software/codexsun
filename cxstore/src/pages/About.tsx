import { useCompanyConfig } from "@/config/company"

export default function About() {
  const { company } = useCompanyConfig()

  return (
    <div className="container py-10 pl-6">
      <h1 className="text-4xl font-bold mb-4">About {company.displayName}</h1>
      <p className="text-lg text-muted-foreground mt-4">
        We provide a highly accessible, extensible, and modular e-commerce management suite built
        on top of our modern distributed architecture (CXServer, AppHost, PostgreSQL).
      </p>
    </div>
  );
}
