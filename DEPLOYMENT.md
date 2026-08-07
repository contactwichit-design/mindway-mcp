# Google Cloud Run Deployment Guide

## Prerequisites
1. Google Cloud SDK (`gcloud`) installed and configured.
2. An active GCP Project with billing enabled.
3. Google Cloud Run API, Cloud Build API, and Artifact Registry API enabled.

---

## Step 1: Create Artifact Registry Repository
Before building or pushing container images, create the Artifact Registry repository named `mindway-mcp`:

```bash
export PROJECT_ID="YOUR_GCP_PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required GCP APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Create Artifact Registry repository in asia-southeast1
gcloud artifacts repositories create mindway-mcp \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Mindway MCP Docker Repository"
```

---

## Step 2: Build & Push Docker Container Image

```bash
# Build container image with Cloud Build
gcloud builds submit --tag asia-southeast1-docker.pkg.dev/$PROJECT_ID/mindway-mcp/server:v1.0.0 .
```

---

## Step 3: Deploy to Google Cloud Run

### Option A: Production Standard (Authenticated - Recommended)
In production, restrict invocation to authorized service accounts or OAuth gateways:

```bash
gcloud run deploy mindway-mcp \
  --image=asia-southeast1-docker.pkg.dev/$PROJECT_ID/mindway-mcp/server:v1.0.0 \
  --region=asia-southeast1 \
  --platform=managed \
  --no-allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

### Option B: Staging / Public Client Access
For unauthenticated public integration testing or public client access (e.g., Gemini Spark unauthenticated custom tools):

```bash
gcloud run deploy mindway-mcp \
  --image=asia-southeast1-docker.pkg.dev/$PROJECT_ID/mindway-mcp/server:v1.0.0 \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

---

## Step 4: Verification

```bash
# 1. Health check
curl https://<SERVICE_URL>/health

# 2. Execute full protocol remote verification suite
npm run verify:remote -- https://<SERVICE_URL>/mcp
```
