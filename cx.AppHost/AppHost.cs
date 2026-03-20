using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

var redisConnectionString = builder.Configuration["ConnectionStrings:cache"]
    ?? "localhost:7024";
var postgresConnectionString = builder.Configuration["ConnectionStrings:codexsun"]
    ?? throw new InvalidOperationException("Connection string 'codexsun' must be configured for AppHost.");

var server = builder.AddProject<Projects.cxserver>("server")
    .WithEnvironment("ConnectionStrings__cache", redisConnectionString)
    .WithEnvironment("ConnectionStrings__codexsun", postgresConnectionString)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints();

var webfrontend = builder.AddJavaScriptApp("cxstore", "../cxstore", "dev")
    .WithEnvironment("PORT", "7023")
    .WithHttpEndpoint(port: 7023, targetPort: 7023, name: "frontend", env: "PORT", isProxied: false)
    .WithReference(server)
    .WaitFor(server);

server.PublishWithContainerFiles(webfrontend, "wwwroot");

builder.Build().Run();
