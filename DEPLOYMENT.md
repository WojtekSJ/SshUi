# 🚀 Deployment Guide

## Docker Deployment

### Local Docker Build & Run

1. **Build the Docker image:**
   ```bash
   docker build -t ollama-ssh-ui .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 ollama-ssh-ui
   ```

3. **Or use docker-compose:**
   ```bash
   docker-compose up -d
   ```

### Azure Container Instances (ACI) Deployment

1. **Build and push to Azure Container Registry (ACR):**
   ```bash
   # Login to Azure
   az login
   
   # Create ACR (if not exists)
   az acr create --resource-group YourResourceGroup --name yourregistryname --sku Basic
   
   # Login to ACR
   az acr login --name yourregistryname
   
   # Build and push image
   docker build -t yourregistryname.azurecr.io/ollama-ssh-ui .
   docker push yourregistryname.azurecr.io/ollama-ssh-ui
   ```

2. **Deploy to Azure Container Instances:**
   ```bash
   az container create \
     --resource-group YourResourceGroup \
     --name ollama-ssh-ui \
     --image yourregistryname.azurecr.io/ollama-ssh-ui \
     --dns-name-label ollama-ssh-ui \
     --ports 5000 \
     --environment-variables NODE_ENV=production PORT=5000
   ```

### Azure App Service Deployment

1. **Create App Service:**
   ```bash
   az appservice plan create --name ollama-ssh-ui-plan --resource-group YourResourceGroup --sku B1 --is-linux
   
   az webapp create --resource-group YourResourceGroup --plan ollama-ssh-ui-plan --name ollama-ssh-ui --deployment-container-image-name yourregistryname.azurecr.io/ollama-ssh-ui
   ```

2. **Configure environment variables:**
   ```bash
   az webapp config appsettings set --resource-group YourResourceGroup --name ollama-ssh-ui --settings NODE_ENV=production PORT=5000
   ```

3. **Enable continuous deployment (optional):**
   ```bash
   az webapp deployment container config --enable-cd true --name ollama-ssh-ui --resource-group YourResourceGroup
   ```

## Environment Variables

- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Port number (default: 5000)

## Security Considerations

1. **SSH Credentials**: Consider using environment variables for SSH credentials in production
2. **HTTPS**: Enable HTTPS in Azure App Service
3. **Authentication**: Add authentication to the web interface for production use
4. **Network Security**: Configure network security groups to restrict access

## Monitoring

- Use Azure Application Insights for monitoring
- Set up logging to Azure Log Analytics
- Configure health checks

## Scaling

- For Azure Container Instances: Use Azure Container Apps for auto-scaling
- For App Service: Configure auto-scaling rules based on CPU/memory usage 