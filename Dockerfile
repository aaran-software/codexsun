FROM node:22-alpine AS frontend-build
WORKDIR /src/cxstore

COPY cxstore/package*.json ./
RUN npm ci

COPY cxstore/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY codexsun.slnx ./
COPY cxserver/cxserver.csproj cxserver/
RUN dotnet restore cxserver/cxserver.csproj

COPY cxserver/ cxserver/
RUN dotnet publish cxserver/cxserver.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/cxstore/dist ./wwwroot

RUN mkdir -p /app/storage/media

EXPOSE 8080

ENTRYPOINT ["dotnet", "cxserver.dll"]
