var builder = DistributedApplication.CreateBuilder(args);

const string RedisConnectionString = "localhost:7024";
const string PostgresConnectionString = "Host=localhost;Port=7025;Database=codexsun;Username=cxadmin;Password=DbPass1@@";

var server = builder.AddProject<Projects.cxserver>("server")
    .WithEnvironment("ConnectionStrings__cache", RedisConnectionString)
    .WithEnvironment("ConnectionStrings__codexsun", PostgresConnectionString)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddJavaScriptApp("cxstore", "../cxstore", "dev")
    .WithEnvironment("PORT", "7023")
    .WithHttpEndpoint(port: 7023, targetPort: 7023, name: "frontend", env: "PORT", isProxied: false)
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
