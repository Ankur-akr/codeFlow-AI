# CodeFlow AI - Deployment Guide

## Deployment to IBM Cloud

This guide provides step-by-step instructions for deploying CodeFlow AI to IBM Cloud using Kubernetes and IBM Cloud services.

## Prerequisites

- IBM Cloud account with appropriate permissions
- IBM Cloud CLI installed
- Docker installed locally
- kubectl installed
- IBM Bob API access credentials

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    IBM Cloud                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │   IBM Cloud Kubernetes Service (IKS)             │  │
│  │                                                    │  │
│  │  ┌──────────────┐      ┌──────────────┐         │  │
│  │  │   Frontend   │      │   Backend    │         │  │
│  │  │   (React)    │◄────►│  (Node.js)   │         │  │
│  │  └──────────────┘      └──────────────┘         │  │
│  │         │                      │                  │  │
│  └─────────┼──────────────────────┼─────────────────┘  │
│            │                      │                     │
│            │                      ▼                     │
│            │          ┌──────────────────┐             │
│            │          │  IBM Databases   │             │
│            │          │   for MongoDB    │             │
│            │          └──────────────────┘             │
│            │                                            │
│            ▼                                            │
│  ┌──────────────────┐                                  │
│  │  IBM Cloud       │                                  │
│  │  Object Storage  │                                  │
│  └──────────────────┘                                  │
│                                                         │
│  ┌──────────────────┐      ┌──────────────┐           │
│  │  IBM Secrets     │      │  IBM Bob API │           │
│  │  Manager         │      │              │           │
│  └──────────────────┘      └──────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## Step 1: Set Up IBM Cloud CLI

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/linux | sh

# Login to IBM Cloud
ibmcloud login

# Target your resource group
ibmcloud target -g <your-resource-group>

# Install container registry plugin
ibmcloud plugin install container-registry

# Install kubernetes service plugin
ibmcloud plugin install kubernetes-service
```

## Step 2: Create IBM Cloud Services

### 2.1 Create Kubernetes Cluster

```bash
# Create a Kubernetes cluster
ibmcloud ks cluster create classic \
  --name codeflow-cluster \
  --zone dal10 \
  --flavor b3c.4x16 \
  --workers 3

# Wait for cluster to be ready (this may take 15-20 minutes)
ibmcloud ks cluster get --cluster codeflow-cluster

# Configure kubectl
ibmcloud ks cluster config --cluster codeflow-cluster
```

### 2.2 Create MongoDB Database

```bash
# Create MongoDB instance
ibmcloud resource service-instance-create codeflow-mongodb \
  databases-for-mongodb standard us-south \
  -p '{"members_memory_allocation_mb": "3072", "members_disk_allocation_mb": "61440"}'

# Get connection string
ibmcloud resource service-key-create codeflow-mongodb-key \
  Manager --instance-name codeflow-mongodb

# Save the connection string for later use
```

### 2.3 Create Object Storage (for repository files)

```bash
# Create Cloud Object Storage instance
ibmcloud resource service-instance-create codeflow-storage \
  cloud-object-storage standard global

# Create service credentials
ibmcloud resource service-key-create codeflow-storage-key \
  Manager --instance-name codeflow-storage

# Create a bucket
ibmcloud cos bucket-create --bucket codeflow-repositories \
  --ibm-service-instance-id <instance-id> \
  --region us-south
```

### 2.4 Set Up Secrets Manager

```bash
# Create Secrets Manager instance
ibmcloud resource service-instance-create codeflow-secrets \
  secrets-manager trial us-south

# Get Secrets Manager endpoint
ibmcloud resource service-instance codeflow-secrets --output json
```

## Step 3: Configure Container Registry

```bash
# Login to IBM Cloud Container Registry
ibmcloud cr login

# Create a namespace
ibmcloud cr namespace-add codeflow

# Set region
ibmcloud cr region-set us-south
```

## Step 4: Build and Push Docker Images

### 4.1 Build Backend Image

```bash
cd backend

# Build the image
docker build -t us.icr.io/codeflow/codeflow-backend:latest .

# Push to registry
docker push us.icr.io/codeflow/codeflow-backend:latest
```

### 4.2 Build Frontend Image

```bash
cd frontend

# Build the image
docker build -t us.icr.io/codeflow/codeflow-frontend:latest .

# Push to registry
docker push us.icr.io/codeflow/codeflow-frontend:latest
```

## Step 5: Create Kubernetes Secrets

```bash
# Create secret for environment variables
kubectl create secret generic codeflow-secrets \
  --from-literal=MONGODB_URI='<your-mongodb-connection-string>' \
  --from-literal=BOB_API_KEY='<your-bob-api-key>' \
  --from-literal=BOB_API_ENDPOINT='<bob-api-endpoint>' \
  --from-literal=GITHUB_CLIENT_ID='<github-client-id>' \
  --from-literal=GITHUB_CLIENT_SECRET='<github-client-secret>' \
  --from-literal=SESSION_SECRET='<random-session-secret>' \
  --from-literal=JWT_SECRET='<random-jwt-secret>'

# Create image pull secret
kubectl create secret docker-registry icr-secret \
  --docker-server=us.icr.io \
  --docker-username=iamapikey \
  --docker-password=<your-ibm-cloud-api-key>
```

## Step 6: Deploy to Kubernetes

### 6.1 Create Kubernetes Manifests

Create `k8s/backend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: codeflow-backend
  template:
    metadata:
      labels:
        app: codeflow-backend
    spec:
      imagePullSecrets:
        - name: icr-secret
      containers:
      - name: backend
        image: us.icr.io/codeflow/codeflow-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "5000"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: MONGODB_URI
        - name: BOB_API_KEY
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: BOB_API_KEY
        - name: BOB_API_ENDPOINT
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: BOB_API_ENDPOINT
        - name: GITHUB_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: GITHUB_CLIENT_ID
        - name: GITHUB_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: GITHUB_CLIENT_SECRET
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: codeflow-secrets
              key: SESSION_SECRET
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: codeflow-backend
spec:
  selector:
    app: codeflow-backend
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: ClusterIP
```

Create `k8s/frontend-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeflow-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: codeflow-frontend
  template:
    metadata:
      labels:
        app: codeflow-frontend
    spec:
      imagePullSecrets:
        - name: icr-secret
      containers:
      - name: frontend
        image: us.icr.io/codeflow/codeflow-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: REACT_APP_API_URL
          value: "http://codeflow-backend:5000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: codeflow-frontend
spec:
  selector:
    app: codeflow-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: codeflow-ingress
  annotations:
    kubernetes.io/ingress.class: "public-iks-k8s-nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - codeflow.yourdomain.com
    secretName: codeflow-tls
  rules:
  - host: codeflow.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: codeflow-backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: codeflow-frontend
            port:
              number: 80
```

### 6.2 Apply Kubernetes Manifests

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services

# Get external IP
kubectl get service codeflow-frontend
```

## Step 7: Configure DNS

```bash
# Get the external IP from the LoadBalancer
EXTERNAL_IP=$(kubectl get service codeflow-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Configure your DNS to point to this IP
# Example: codeflow.yourdomain.com -> EXTERNAL_IP
```

## Step 8: Set Up SSL/TLS

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: public-iks-k8s-nginx
EOF
```

## Step 9: Configure Monitoring

```bash
# Install IBM Cloud Monitoring
ibmcloud ob monitoring config create \
  --cluster codeflow-cluster \
  --instance <monitoring-instance-name>

# Install IBM Cloud Logging
ibmcloud ob logging config create \
  --cluster codeflow-cluster \
  --instance <logging-instance-name>
```

## Step 10: Set Up Auto-Scaling

Create `k8s/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: codeflow-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: codeflow-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: codeflow-frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: codeflow-frontend
  minReplicas: 2
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

Apply the HPA:
```bash
kubectl apply -f k8s/hpa.yaml
```

## Step 11: Configure Backup

```bash
# Create backup script for MongoDB
cat > backup-mongodb.sh <<'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb_${TIMESTAMP}"

# Create backup
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}"

# Upload to Cloud Object Storage
ibmcloud cos upload --bucket codeflow-backups \
  --key "mongodb_${TIMESTAMP}.tar.gz" \
  --file "${BACKUP_DIR}.tar.gz"
EOF

chmod +x backup-mongodb.sh

# Schedule with cron
# 0 2 * * * /path/to/backup-mongodb.sh
```

## Step 12: CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to IBM Cloud

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Install IBM Cloud CLI
      run: |
        curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
        ibmcloud plugin install container-registry
        ibmcloud plugin install kubernetes-service
    
    - name: Login to IBM Cloud
      run: |
        ibmcloud login --apikey ${{ secrets.IBM_CLOUD_API_KEY }} -r us-south
        ibmcloud cr login
    
    - name: Build and Push Backend
      run: |
        cd backend
        docker build -t us.icr.io/codeflow/codeflow-backend:${{ github.sha }} .
        docker push us.icr.io/codeflow/codeflow-backend:${{ github.sha }}
    
    - name: Build and Push Frontend
      run: |
        cd frontend
        docker build -t us.icr.io/codeflow/codeflow-frontend:${{ github.sha }} .
        docker push us.icr.io/codeflow/codeflow-frontend:${{ github.sha }}
    
    - name: Deploy to Kubernetes
      run: |
        ibmcloud ks cluster config --cluster codeflow-cluster
        kubectl set image deployment/codeflow-backend \
          backend=us.icr.io/codeflow/codeflow-backend:${{ github.sha }}
        kubectl set image deployment/codeflow-frontend \
          frontend=us.icr.io/codeflow/codeflow-frontend:${{ github.sha }}
        kubectl rollout status deployment/codeflow-backend
        kubectl rollout status deployment/codeflow-frontend
```

## Monitoring and Maintenance

### View Logs

```bash
# Backend logs
kubectl logs -f deployment/codeflow-backend

# Frontend logs
kubectl logs -f deployment/codeflow-frontend

# All pods
kubectl logs -l app=codeflow-backend --tail=100
```

### Check Resource Usage

```bash
# Pod resource usage
kubectl top pods

# Node resource usage
kubectl top nodes
```

### Update Deployment

```bash
# Update backend
docker build -t us.icr.io/codeflow/codeflow-backend:v2 backend/
docker push us.icr.io/codeflow/codeflow-backend:v2
kubectl set image deployment/codeflow-backend backend=us.icr.io/codeflow/codeflow-backend:v2

# Rollback if needed
kubectl rollout undo deployment/codeflow-backend
```

## Cost Optimization

1. **Right-size resources**: Adjust CPU/memory based on actual usage
2. **Use auto-scaling**: Scale down during low traffic
3. **Reserved capacity**: Use reserved instances for predictable workloads
4. **Object storage lifecycle**: Set up lifecycle policies for old files
5. **Database optimization**: Monitor and optimize MongoDB queries

## Security Best Practices

1. **Network Policies**: Restrict pod-to-pod communication
2. **RBAC**: Implement role-based access control
3. **Secrets Rotation**: Regularly rotate secrets
4. **Image Scanning**: Scan images for vulnerabilities
5. **TLS Everywhere**: Use TLS for all communications

## Troubleshooting

### Pod Not Starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service Not Accessible

```bash
kubectl get endpoints
kubectl describe service <service-name>
```

### Database Connection Issues

```bash
# Test MongoDB connection
kubectl run -it --rm debug --image=mongo:6 --restart=Never -- \
  mongosh "<connection-string>"
```

## Support

For issues or questions:
- IBM Cloud Support: https://cloud.ibm.com/unifiedsupport
- IBM Bob Documentation: [IBM Bob Docs]
- GitHub Issues: https://github.com/yourusername/codeflow-ai/issues

---

Deployment complete! Your CodeFlow AI platform is now running on IBM Cloud.