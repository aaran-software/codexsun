# Storage Permissions and Volumes

This application dynamically creates and interacts with a `storage/` directory inside the working root (`cxserver/storage`).

When deploying to a cloud server, docker container, or standard Linux/Windows server setup, this folder **must have read/write access** configured for the user running the application and **should be tracked on a persistent volume** to prevent media loss over deployments.

## Docker Deployments (Recommended)

If you are using Docker, you need to mount a volume directly to where the `storage` folder lives, so it doesn't get destroyed on container restarts.

```yaml
# Example docker-compose.yml
services:
  cxserver:
    image: myregistry/cxserver:latest
    volumes:
      - ./persistent_storage:/app/storage
      # Or using an explicit named volume
      # - cxserver_storage:/app/storage
    ports:
      - "5034:80"

volumes:
  cxserver_storage:
```

## Linux Generic Server Deployments (NGINX / Systemd)

If you are running the application via Kestrel directly on a Linux virtual machine (via `systemctl`), ensure that the `storage` folder is created and the linux user running the app (typically `www-data` or a dedicated app user) has write access and ownership.

```bash
# Example setup script on the deployment machine
cd /var/www/cxserver
mkdir -p storage 
sudo chown -R www-data:www-data storage
sudo chmod -R 775 storage
```

## Windows IIS Deployments

If you are hosting using Windows IIS via the ASP.NET Core module, ensure the `IIS_IUSRS` group is granted explicit `Modify` access to the `storage/` directory within the application root.

1. Right-click the `cxserver/storage` folder.
2. Go to **Properties -> Security -> Edit**.
3. Add or select **IIS_IUSRS**.
4. Check **Modify** under the 'Allow' column.
5. Click OK.
