# Jenkins Credentials Setup Guide

## Overview
This guide will help you configure the required credentials in Jenkins for your CI/CD pipeline.

## Required Credentials

You need to create **2 credentials** in Jenkins:

### 1. DockerHub Credentials
### 2. EC2 SSH Key Credentials

---

## Step-by-Step Setup Instructions

### 📦 Credential 1: DockerHub Credentials

**Purpose:** Allows Jenkins to push Docker images to your DockerHub account.

#### Steps:

1. **Navigate to Jenkins Credentials:**
   - Go to Jenkins Dashboard
   - Click `Manage Jenkins` (left sidebar)
   - Click `Credentials`
   - Click `System`
   - Click `Global credentials (unrestricted)`
   - Click `Add Credentials`

2. **Configure DockerHub Credential:**
   ```
   Kind: Username with password
   Scope: Global
   Username: thisarasamuditha
   Password: [Your DockerHub Password]
   ID: dockerhub-creds
   Description: DockerHub credentials for pushing images
   ```

3. **Click `Create`**

---

### 🔑 Credential 2: EC2 SSH Key

**Purpose:** Allows Jenkins to SSH into your EC2 instance for deployment.

#### Steps:

1. **Get your SSH Private Key:**
   - Your private key is located at: `terraform/devops-key`
   - Open this file in a text editor
   - Copy the **entire content** including:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [key content]
     -----END OPENSSH PRIVATE KEY-----
     ```

2. **Navigate to Jenkins Credentials:**
   - Go to Jenkins Dashboard
   - Click `Manage Jenkins`
   - Click `Credentials`
   - Click `System`
   - Click `Global credentials (unrestricted)`
   - Click `Add Credentials`

3. **Configure SSH Credential:**
   ```
   Kind: SSH Username with private key
   Scope: Global
   ID: ec2-ssh-key
   Description: EC2 SSH key for deployment
   Username: ubuntu
   Private Key: Enter directly
   ```

4. **Add Private Key:**
   - Click `Add` under "Private Key"
   - Paste the entire content of `terraform/devops-key` file
   - **Important:** Include the BEGIN and END lines

5. **Click `Create`**

---

## Verification

After creating both credentials, verify they appear in your credentials list:

### Expected Credentials List:
| ID | Name | Kind |
|----|------|------|
| dockerhub-creds | DockerHub credentials for pushing images | Username with password |
| ec2-ssh-key | EC2 SSH key for deployment | SSH Username with private key |

---

## Testing the Pipeline

1. **Commit and Push your code:**
   ```bash
   git add .
   git commit -m "Update Jenkins pipeline with optimized build"
   git push origin main
   ```

2. **Manual Build (Optional):**
   - Go to your Jenkins job
   - Click `Build Now`

3. **Monitor the Pipeline:**
   - Click on the build number (e.g., #15)
   - Click `Console Output`
   - Watch each stage execute:
     - ✅ Checkout
     - ✅ Build Docker Images (parallel)
     - ✅ Test (parallel)
     - ✅ Push to Docker Hub
     - ✅ Deploy to EC2
     - ✅ Health Check

---

## Troubleshooting

### Common Issues:

**1. DockerHub Login Failed:**
- Verify username is exactly: `thisarasamuditha`
- Verify password is correct
- Check credential ID is: `dockerhub-creds`

**2. SSH Connection Failed:**
- Verify private key includes BEGIN/END lines
- Verify username is: `ubuntu`
- Verify credential ID is: `ec2-ssh-key`
- Check EC2 security group allows SSH from Jenkins server

**3. Permission Denied on EC2:**
- Verify the SSH key matches the one used in Terraform
- Check file permissions: `chmod 600 terraform/devops-key`

---

## Security Best Practices

✅ **DO:**
- Use credential IDs exactly as specified
- Keep credentials in Jenkins, never in code
- Regularly rotate passwords and keys
- Use descriptive names for credentials

❌ **DON'T:**
- Commit credentials to Git
- Share credentials in plain text
- Use same credentials across environments
- Hard-code passwords in Jenkinsfile

---

## Pipeline Features

Your new optimized pipeline includes:

✨ **Parallel Builds** - Backend and Frontend build simultaneously
✨ **Parallel Testing** - Tests run in parallel with image verification
✨ **Build Tagging** - Each build gets unique number tag + latest
✨ **Ansible Deployment** - Automated deployment using Ansible playbook
✨ **Health Checks** - Automatic verification after deployment
✨ **Clean-up** - Automatic removal of local images to save space

---

## Quick Reference

```bash
# Jenkins Credentials Path
Dashboard → Manage Jenkins → Credentials → System → Global credentials

# Credential IDs (must match exactly)
dockerhub-creds    # Username with password
ec2-ssh-key        # SSH Username with private key

# Environment Variables (automatically set)
DOCKER_HUB_REPO = 'thisarasamuditha'
IMAGE_TAG = "${BUILD_NUMBER}"
EC2_HOST = '43.205.116.130'
EC2_USER = 'ubuntu'
APP_DIR = '/home/ubuntu/app'
```

---

## Next Steps

1. ✅ Create both credentials in Jenkins
2. ✅ Verify credentials are saved
3. ✅ Commit the new Jenkinsfile
4. ✅ Push to GitHub (triggers webhook)
5. ✅ Monitor build execution
6. ✅ Access your app at: http://43.205.116.130

---

**Need Help?**
- Check Jenkins Console Output for detailed logs
- Verify all credential IDs match exactly
- Ensure EC2 security groups allow required ports (22, 80, 8088, 3306)
