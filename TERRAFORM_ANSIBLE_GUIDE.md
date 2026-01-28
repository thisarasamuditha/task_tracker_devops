# 🏗️ Understanding Terraform and Ansible in DevOps

## 📚 Table of Contents
- [The Building Analogy](#the-building-analogy)
- [What is Terraform?](#what-is-terraform)
- [What is Ansible?](#what-is-ansible)
- [Terraform in This Project](#terraform-in-this-project)
- [Ansible in This Project](#ansible-in-this-project)
- [Why Use Both?](#why-use-both)
- [Key Differences](#key-differences)
- [Workflow in This Project](#workflow-in-this-project)

---

## 🏛️ The Building Analogy

Imagine you want to build and furnish a house:

### **Terraform = The Construction Company** 🏗️
Terraform is like a **construction company** that builds the physical infrastructure:
- **Buys the land** (AWS account/region)
- **Lays the foundation** (Network infrastructure)
- **Builds the walls and roof** (EC2 instances, security groups)
- **Installs doors and windows** (Firewall rules, ports)
- **Connects utilities** (Internet gateway, routing)

When you're done, you have an **empty building** ready to move in, but with no furniture, appliances, or decorations.

### **Ansible = The Interior Designer & Moving Company** 🎨
Ansible is like an **interior designer and moving company** that makes the house livable:
- **Installs appliances** (Docker, Docker Compose)
- **Arranges furniture** (Application containers)
- **Hangs artwork** (Configuration files)
- **Ensures everything works** (Starts services, checks status)
- **Makes updates** (Deploys new versions)

When Ansible is done, your house is **fully furnished and ready to live in**.

### **The Complete Picture** 🖼️
```
Terraform builds the house → Ansible furnishes it → You have a working home
     (Infrastructure)              (Configuration)        (Running Application)
```

**Key Insight**: You can't furnish a house that doesn't exist (need Terraform first), but an empty house isn't useful (need Ansible after).

---

## 🌍 What is Terraform?

### **Definition**
Terraform is an **Infrastructure as Code (IaC)** tool that provisions and manages cloud infrastructure through declarative configuration files.

### **Core Concepts**
```
┌─────────────────────────────────────────┐
│         TERRAFORM WORKFLOW              │
├─────────────────────────────────────────┤
│                                         │
│  1. WRITE (main.tf)                     │
│     ↓                                   │
│  2. PLAN (terraform plan)               │
│     ↓                                   │
│  3. CREATE (terraform apply)            │
│     ↓                                   │
│  4. TRACK (terraform.tfstate)           │
│     ↓                                   │
│  5. DESTROY (terraform destroy)         │
│                                         │
└─────────────────────────────────────────┘
```

### **What Terraform Does**
- ✅ Creates cloud resources (servers, networks, storage)
- ✅ Manages infrastructure lifecycle
- ✅ Tracks state of all resources
- ✅ Ensures idempotency (safe to run multiple times)
- ✅ Destroys infrastructure when no longer needed

### **What Terraform Does NOT Do**
- ❌ Install software on servers
- ❌ Configure applications
- ❌ Deploy application code
- ❌ Manage container orchestration

---

## ⚙️ What is Ansible?

### **Definition**
Ansible is a **Configuration Management** and **Application Deployment** tool that automates software installation, configuration, and deployment on existing servers.

### **Core Concepts**
```
┌─────────────────────────────────────────┐
│          ANSIBLE WORKFLOW               │
├─────────────────────────────────────────┤
│                                         │
│  1. INVENTORY (inventory.ini)           │
│     - List of servers                   │
│     ↓                                   │
│  2. PLAYBOOK (deploy.yml)               │
│     - Tasks to execute                  │
│     ↓                                   │
│  3. EXECUTE (ansible-playbook)          │
│     - Runs tasks on servers             │
│     ↓                                   │
│  4. IDEMPOTENT                          │
│     - Safe to run multiple times        │
│                                         │
└─────────────────────────────────────────┘
```

### **What Ansible Does**
- ✅ Installs and configures software
- ✅ Deploys applications
- ✅ Manages configuration files
- ✅ Orchestrates multi-step deployments
- ✅ Updates running systems

### **What Ansible Does NOT Do**
- ❌ Create cloud infrastructure
- ❌ Manage infrastructure state
- ❌ Provision virtual machines
- ❌ Create networks or security groups

---

## 🎯 Terraform in This Project

### **Location**
```
terraform/
├── main.tf              # Infrastructure definition
├── devops-key           # Private SSH key
├── devops-key.pub       # Public SSH key
├── terraform.tfstate    # Current infrastructure state
└── terraform.tfstate.backup
```

### **What It Creates**

#### 1️⃣ **Security Group** (`aws_security_group.devops_sg`)
```
Purpose: Acts as a virtual firewall
Opens ports:
  - Port 22  (SSH - for remote access)
  - Port 80  (HTTP - for frontend)
  - Port 8088 (Backend API)
  - Port 3306 (MySQL database)
```

#### 2️⃣ **SSH Key Pair** (`aws_key_pair.devops_key`)
```
Purpose: Secure authentication to EC2 instance
Uses: devops-key.pub (your public key)
Allows: SSH access without passwords
```

#### 3️⃣ **EC2 Instance** (`aws_instance.devops_server`)
```
Type: t3.micro (Free tier eligible)
OS: Ubuntu 22.04 LTS
Region: ap-south-1 (Mumbai)
Storage: 20GB SSD
```

### **Real Project Code Explanation**

#### Security Group Configuration
```hcl
resource "aws_security_group" "devops_sg" {
  name = "devops-project-sg"
  
  # SSH - So you can remotely access the server
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTP - So users can access your frontend
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Backend API - So frontend can communicate with backend
  ingress {
    from_port   = 8088
    to_port     = 8088
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

#### EC2 Instance Configuration
```hcl
resource "aws_instance" "devops_server" {
  ami           = "ami-0ff91eb5c6fe7cc86"  # Ubuntu 22.04
  instance_type = "t3.micro"                # Free tier
  
  key_name               = aws_key_pair.devops_key.key_name
  vpc_security_group_ids = [aws_security_group.devops_sg.id]
  
  root_block_device {
    volume_size = 20  # GB storage
  }
}
```

### **Outputs Provided**
```hcl
output "instance_public_ip"  # e.g., 43.205.116.130
output "ssh_command"         # e.g., ssh -i devops-key ubuntu@43.205.116.130
output "frontend_url"        # e.g., http://43.205.116.130
output "backend_url"         # e.g., http://43.205.116.130:8088
```

### **Commands Used**
```bash
# Initialize Terraform (download AWS provider)
terraform init

# Preview what will be created
terraform plan

# Create the infrastructure
terraform apply

# View created resources
terraform show

# Destroy everything (cleanup)
terraform destroy
```

---

## 🚀 Ansible in This Project

### **Location**
```
ansible/
├── deploy.yml       # Playbook - what to do
└── inventory.ini    # Inventory - where to do it
```

### **Inventory File** (`inventory.ini`)
```ini
[devops_server]
devops ansible_host=43.205.116.130 ansible_user=ubuntu

# This tells Ansible:
# - Server name: "devops"
# - IP address: 43.205.116.130 (from Terraform output)
# - Username: ubuntu
# - Python location: /usr/bin/python3
```

### **What the Playbook Does** (`deploy.yml`)

The playbook executes **15 tasks** in sequence:

#### **Phase 1: System Preparation** (Tasks 1-4)
```yaml
1. Update apt cache           # Refresh package list
2. Install prerequisites      # Install basic tools
3. Create Docker key dir      # Prepare for Docker installation
4. Add Docker GPG key         # Security for Docker packages
```

#### **Phase 2: Docker Installation** (Tasks 5-8)
```yaml
5. Add Docker repository      # Add Docker package source
6. Install Docker             # Install Docker Engine + Compose
7. Start Docker service       # Enable Docker on boot
8. Add user to docker group   # Allow ubuntu user to run Docker
```

#### **Phase 3: Application Deployment** (Tasks 9-12)
```yaml
9. Create app directory       # /home/ubuntu/app
10. Copy docker-compose.yml   # Your application definition
11. Docker login              # Authenticate with DockerHub
12. Pull latest images        # Download your containers
```

#### **Phase 4: Launch Application** (Tasks 13-15)
```yaml
13. Stop old containers       # Clean shutdown of old version
14. Start new containers      # Launch updated application
15. Verify containers         # Check all services are running
```

### **Real Project Code Explanation**

#### Installing Docker
```yaml
- name: Install Docker
  apt:
    name:
      - docker-ce              # Docker Engine
      - docker-ce-cli          # Docker command-line
      - containerd.io          # Container runtime
      - docker-compose-plugin  # Docker Compose v2
    state: present
    update_cache: yes
```

#### Deploying Application
```yaml
- name: Copy docker-compose.yml to server
  copy:
    src: ../docker-compose.yml          # From your local machine
    dest: /home/ubuntu/app/docker-compose.yml  # To EC2 server
    owner: ubuntu
    mode: '0644'

- name: Start containers
  command: docker compose up -d
  args:
    chdir: /home/ubuntu/app
  become_user: ubuntu
```

### **Commands Used**
```bash
# Test connection to server
ansible devops_server -m ping -i inventory.ini

# Run the deployment playbook
ansible-playbook -i inventory.ini deploy.yml

# Run with verbose output (troubleshooting)
ansible-playbook -i inventory.ini deploy.yml -vvv

# Run specific tasks only
ansible-playbook -i inventory.ini deploy.yml --tags "deploy"
```

---

## 🤔 Why Use Both?

### **Separation of Concerns**

| Aspect | Terraform | Ansible |
|--------|-----------|---------|
| **Focus** | Infrastructure | Configuration |
| **When** | Before deployment | After infrastructure exists |
| **Changes** | Rare (infrastructure is stable) | Frequent (code updates) |
| **Language** | HCL (HashiCorp Configuration Language) | YAML |
| **State** | Tracks infrastructure state | Stateless (checks current state) |
| **Idempotent** | Yes | Yes |

### **Real-World Benefits**

#### **Terraform Benefits**
```
✅ Version-controlled infrastructure
✅ Reproducible environments (dev, staging, prod)
✅ Cost management (destroy unused resources)
✅ Multi-cloud support (AWS, Azure, GCP)
✅ Dependency management (security group before EC2)
```

#### **Ansible Benefits**
```
✅ Agentless (no software needed on target servers)
✅ Simple YAML syntax (easy to learn)
✅ Fast deployments (no waiting for infrastructure)
✅ Rollback capability
✅ Works on any Linux server
```

### **Together They Provide**
```
🏗️ Terraform → Creates 10 identical servers in 5 minutes
⚙️ Ansible  → Configures all 10 servers consistently
🚀 Result   → Full production environment with zero manual work
```

---

## 🔄 Key Differences

### **Visual Comparison**

```
┌───────────────────────────────────────────────────────────────┐
│                    TERRAFORM vs ANSIBLE                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  TERRAFORM                         ANSIBLE                   │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  🏗️ Infrastructure                 ⚙️ Configuration           │
│  📋 Declarative                    📋 Procedural/Declarative │
│  💾 Stateful                       🔄 Stateless              │
│  ☁️ Cloud providers                🖥️ Any server             │
│  🐢 Slow changes                   🚀 Fast deployments       │
│  🔐 API-based                      🔌 SSH-based              │
│  📊 State file required            📊 No state file          │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### **When to Use Each**

#### Use Terraform When:
- Creating new cloud infrastructure
- Provisioning servers, networks, storage
- Managing infrastructure lifecycle
- Need to track infrastructure state
- Working with cloud provider APIs

#### Use Ansible When:
- Installing software on existing servers
- Deploying application updates
- Configuring system settings
- Managing configuration files
- Orchestrating multi-step processes

---

## 🔄 Workflow in This Project

### **Complete Deployment Flow**

```
Step 1: TERRAFORM - Build Infrastructure
┌─────────────────────────────────────────┐
│ $ cd terraform/                         │
│ $ terraform init                        │
│ $ terraform plan                        │
│ $ terraform apply                       │
│                                         │
│ ✅ Creates EC2 instance                 │
│ ✅ Configures security groups           │
│ ✅ Sets up SSH key                      │
│ ✅ Outputs IP address: 43.205.116.130   │
└─────────────────────────────────────────┘
                    ↓
Step 2: UPDATE ANSIBLE INVENTORY
┌─────────────────────────────────────────┐
│ $ cd ../ansible/                        │
│ $ nano inventory.ini                    │
│                                         │
│ # Add Terraform output IP               │
│ devops ansible_host=43.205.116.130     │
└─────────────────────────────────────────┘
                    ↓
Step 3: ANSIBLE - Configure & Deploy
┌─────────────────────────────────────────┐
│ $ ansible-playbook -i inventory.ini \  │
│   deploy.yml                            │
│                                         │
│ ✅ Installs Docker                      │
│ ✅ Copies docker-compose.yml            │
│ ✅ Pulls application images             │
│ ✅ Starts containers                    │
│ ✅ Verifies deployment                  │
└─────────────────────────────────────────┘
                    ↓
Step 4: APPLICATION RUNNING
┌─────────────────────────────────────────┐
│ Frontend:  http://43.205.116.130       │
│ Backend:   http://43.205.116.130:8088  │
│ Database:  MySQL container (internal)   │
└─────────────────────────────────────────┘
```

### **Update Application (Without Terraform)**

```bash
# Only need Ansible for updates
$ cd ansible/
$ ansible-playbook -i inventory.ini deploy.yml

# Ansible will:
# 1. Pull new Docker images
# 2. Stop old containers
# 3. Start new containers
# 4. Verify everything works

# Infrastructure unchanged (still same EC2, security groups, etc.)
```

### **Destroy Everything**

```bash
# Step 1: Stop application (optional)
$ cd ansible/
$ ansible devops_server -i inventory.ini -m shell \
  -a "docker compose -f /home/ubuntu/app/docker-compose.yml down"

# Step 2: Destroy infrastructure
$ cd ../terraform/
$ terraform destroy

# ✅ Everything deleted
# ✅ No AWS charges
```

---

## 🎓 Learning Summary

### **The Golden Rule**
```
🏗️ Use Terraform for "WHAT servers exist"
⚙️ Use Ansible for "WHAT's ON the servers"
```

### **Real-World Analogy Applied to Your Project**

| Building a House | Your DevOps Project |
|------------------|---------------------|
| Buy land | Select AWS region (ap-south-1) |
| Pour foundation | Create VPC/network (default) |
| Build walls | Launch EC2 instance (t3.micro) |
| Install doors/windows | Configure security group (ports) |
| Connect electricity | Attach public IP |
| **↓ Terraform Done ↓** | **↓ Infrastructure Ready ↓** |
| Move in furniture | Install Docker |
| Hang pictures | Copy docker-compose.yml |
| Stock kitchen | Pull container images |
| Turn on appliances | Start Docker containers |
| **↓ Ansible Done ↓** | **↓ Application Running ↓** |

### **Key Takeaways**

1. **Terraform = Infrastructure Layer**
   - Creates the servers and networking
   - Rarely changes once set up
   - Uses AWS API

2. **Ansible = Application Layer**
   - Configures software and deploys apps
   - Changes frequently with code updates
   - Uses SSH

3. **Both Are Idempotent**
   - Safe to run multiple times
   - Won't create duplicates
   - Will only make necessary changes

4. **Both Use IaC (Infrastructure as Code)**
   - Version controlled (Git)
   - Reproducible
   - Documented
   - Automated

---

## 📚 Additional Resources

### **Terraform**
- Official Docs: https://www.terraform.io/docs
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws
- Best Practices: https://www.terraform.io/docs/cloud/guides/recommended-practices

### **Ansible**
- Official Docs: https://docs.ansible.com
- Playbook Guide: https://docs.ansible.com/ansible/latest/user_guide/playbooks.html
- Docker Module: https://docs.ansible.com/ansible/latest/collections/community/docker

### **This Project**
- See [README.md](README.md) for complete setup instructions
- See [AWS_CLI_INTEGRATION.md](AWS_CLI_INTEGRATION.md) for AWS CLI usage
- Check `terraform/main.tf` for infrastructure code
- Check `ansible/deploy.yml` for deployment automation

---

## 🎯 Quick Command Reference

### **Terraform Commands**
```bash
terraform init      # Initialize (first time only)
terraform plan      # Preview changes
terraform apply     # Create infrastructure
terraform destroy   # Delete everything
terraform output    # Show output values
terraform show      # Show current state
```

### **Ansible Commands**
```bash
# Test connection
ansible all -i inventory.ini -m ping

# Run playbook
ansible-playbook -i inventory.ini deploy.yml

# Check syntax
ansible-playbook deploy.yml --syntax-check

# Dry run (don't make changes)
ansible-playbook -i inventory.ini deploy.yml --check

# Verbose output
ansible-playbook -i inventory.ini deploy.yml -v
```

---

**🎓 Remember**: Terraform builds the stage, Ansible performs the show! 🎭

