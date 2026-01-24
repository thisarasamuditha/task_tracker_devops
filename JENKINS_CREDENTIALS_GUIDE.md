# Jenkins Credentials Setup Guide

## Overview
This guide provides step-by-step instructions for configuring the required credentials in Jenkins to enable automated CI/CD deployment for your application.

---

## Required Credentials

Your Jenkins pipeline requires two credentials:

1. **DockerHub Credentials** - For pushing Docker images
2. **EC2 SSH Key** - For deploying to AWS EC2 instance

---

## Credential 1: DockerHub Credentials

### Purpose
Allows Jenkins to authenticate with DockerHub and push Docker images to your repository.

### Setup Instructions

1. **Navigate to Credentials**
   - Open Jenkins Dashboard
   - Click **Manage Jenkins** from the left sidebar
   - Click **Credentials**
   - Click **System**
   - Click **Global credentials (unrestricted)**
   - Click **Add Credentials**

2. **Configure the Credential**
   - **Kind:** Username with password
   - **Scope:** Global (Jenkins, nodes, items, all child items, etc)
   - **Username:** `thisarasamuditha`
   - **Password:** Enter your DockerHub account password
   - **ID:** `dockerhub-credentials`
   - **Description:** DockerHub credentials for image registry

3. **Save the Credential**
   - Click **Create** button

### Verification
- The credential should appear in the credentials list
- ID should exactly match: `dockerhub-credentials`

---

## Credential 2: EC2 SSH Key

### Purpose
Allows Jenkins to connect to your EC2 instance via SSH for automated deployment using Ansible.

### Preparation

1. **Locate Your Private Key**
   - Path: `terraform/devops-key`
   - This is the SSH private key used to access your EC2 instance

2. **Copy the Private Key Content**
   - Open the file `terraform/devops-key` in a text editor
   - Copy the entire content including:
     ```
     -----BEGIN OPENSSH PRIVATE KEY-----
     [key content lines]
     -----END OPENSSH PRIVATE KEY-----
     ```

### Setup Instructions

1. **Navigate to Credentials**
   - Open Jenkins Dashboard
   - Click **Manage Jenkins**
   - Click **Credentials**
   - Click **System**
   - Click **Global credentials (unrestricted)**
   - Click **Add Credentials**

2. **Configure the Credential**
   - **Kind:** SSH Username with private key
   - **Scope:** Global (Jenkins, nodes, items, all child items, etc)
   - **ID:** `ec2-ssh-key`
   - **Description:** EC2 SSH private key for deployment
   - **Username:** `ubuntu`
   - **Private Key:** Select "Enter directly"

3. **Add the Private Key**
   - Click the **Add** button under "Private Key"
   - Paste the entire content of your `terraform/devops-key` file
   - Ensure you include the BEGIN and END marker lines

4. **Save the Credential**
   - Click **Create** button

### Verification
- The credential should appear in the credentials list
- ID should exactly match: `ec2-ssh-key`
- Username should be: `ubuntu`

---

## Credentials Summary

After completing the setup, you should have these two credentials:

| Credential ID | Type | Username | Purpose |
|---------------|------|----------|---------|
| dockerhub-credentials | Username with password | thisarasamuditha | Push images to DockerHub |
| ec2-ssh-key | SSH Username with private key | ubuntu | Deploy to EC2 instance |

---

## Verification Steps

### 1. Check Credentials List
- Navigate to: Dashboard > Manage Jenkins > Credentials > System > Global credentials
- Verify both credentials are listed
- Ensure the IDs match exactly as specified

### 2. Test DockerHub Credential
- Run a manual build
- Check the "Push Images to DockerHub" stage
- Verify successful authentication and image push

### 3. Test SSH Credential
- Run a manual build
- Check the "Deploy to EC2 using Ansible" stage
- Verify successful SSH connection to EC2

---

## Troubleshooting

### Issue: DockerHub authentication fails

**Symptoms:**
```
Error response from daemon: Get https://registry-1.docker.io/v2/: unauthorized
```

**Solutions:**
- Verify username is exactly: `thisarasamuditha`
- Confirm password is correct
- Check credential ID is: `dockerhub-credentials`
- Ensure DockerHub account is active

### Issue: SSH connection to EC2 fails

**Symptoms:**
```
Permission denied (publickey)
```

**Solutions:**
- Verify the private key content is complete
- Ensure BEGIN and END lines are included
- Check username is: `ubuntu`
- Verify credential ID is: `ec2-ssh-key`
- Confirm EC2 security group allows SSH (port 22) from Jenkins server
- Verify the SSH key matches the one in EC2 instance

### Issue: Credential not found

**Symptoms:**
```
Credentials 'dockerhub-credentials' could not be found
```

**Solutions:**
- Check the credential ID spelling exactly matches
- Ensure credential scope is set to "Global"
- Verify credential exists in System > Global credentials

---

## Security Best Practices

### Do's
- Keep credentials in Jenkins only, never commit to repository
- Use descriptive names for easy identification
- Regularly rotate passwords and SSH keys
- Use unique credentials for different environments (dev, staging, prod)
- Review credential access logs periodically

### Don'ts
- Never hardcode credentials in Jenkinsfile
- Don't share credentials via email or chat
- Avoid using the same password across multiple services
- Don't commit private keys to version control
- Never expose credentials in console output

---

## Pipeline Execution

Once credentials are configured, the pipeline will:

1. Pull code from GitHub automatically via webhook
2. Build Docker images for backend and frontend
3. Authenticate with DockerHub using stored credentials
4. Push images to your DockerHub repository
5. Update docker-compose.yml with correct image references
6. Connect to EC2 via SSH using stored key
7. Execute Ansible playbook to deploy containers
8. Verify deployment and provide access URLs

---

## Testing Your Setup

### Manual Pipeline Trigger

1. **Navigate to Your Jenkins Job**
   - Open Jenkins Dashboard
   - Click on your pipeline job

2. **Start a Build**
   - Click **Build Now**

3. **Monitor Execution**
   - Click on the build number (e.g., #1)
   - Click **Console Output**
   - Watch each stage execute

4. **Verify Success**
   - All stages should complete successfully
   - Application should be accessible at: http://43.205.116.130

### Automatic Trigger via GitHub Webhook

1. **Push Code to Repository**
   ```bash
   git add .
   git commit -m "Test Jenkins pipeline"
   git push origin main
   ```

2. **Verify Webhook Trigger**
   - Jenkins should automatically start a build
   - Check Jenkins job for new build execution

3. **Monitor Build Progress**
   - Watch the pipeline execute all stages
   - Verify deployment completes successfully

---

## Environment Variables Reference

The pipeline uses these environment variables:

```groovy
DOCKERHUB_USERNAME = 'thisarasamuditha'    // Your DockerHub username
IMAGE_TAG = "${BUILD_NUMBER}"               // Unique build number
EC2_HOST = '43.205.116.130'                // EC2 instance IP
EC2_USER = 'ubuntu'                        // EC2 SSH username
APP_DIR = '/home/ubuntu/app'               // Application directory on EC2
```

---

## Application Access URLs

After successful deployment:

- **Frontend Application:** http://43.205.116.130
- **Backend API:** http://43.205.116.130:8088/api
- **Database:** mysql://43.205.116.130:3306/taskdb

---

## Support and Maintenance

### Regular Maintenance Tasks

1. **Monitor Build History**
   - Check for failed builds regularly
   - Review console output for warnings

2. **Update Credentials**
   - Rotate DockerHub password every 90 days
   - Update SSH keys if EC2 instance changes

3. **Clean Old Images**
   - Pipeline automatically cleans local images
   - Periodically clean DockerHub unused tags

### Getting Help

If you encounter issues:
1. Check the Console Output for detailed error messages
2. Verify all credential IDs match exactly
3. Ensure EC2 security groups allow required ports
4. Review Ansible playbook execution logs
5. Check Docker service status on EC2

---

## Pipeline Architecture

```
Developer Push Code
      |
      v
   GitHub (Webhook)
      |
      v
   Jenkins CI/CD
      |
      +-- Stage 1: Checkout Code
      |
      +-- Stage 2: Build Backend Image
      |
      +-- Stage 3: Build Frontend Image
      |
      +-- Stage 4: Push to DockerHub (uses dockerhub-credentials)
      |
      +-- Stage 5: Update docker-compose
      |
      +-- Stage 6: Deploy via Ansible (uses ec2-ssh-key)
      |
      v
   EC2 Instance
      |
      +-- React Frontend (Port 80)
      |
      +-- Spring Boot Backend (Port 8088)
      |
      +-- MySQL Database (Port 3306)
```

---

## Conclusion

With these credentials properly configured, your Jenkins pipeline will automatically:
- Build Docker images on every code push
- Push images to DockerHub registry
- Deploy updated containers to EC2
- Ensure zero-downtime deployments
- Provide deployment status and URLs

This creates a fully automated CI/CD pipeline that eliminates manual deployment steps and ensures consistent, reliable application delivery.
