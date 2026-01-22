terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"  # Change to your preferred region
}

# Security Group - Allow SSH, HTTP, and backend ports
resource "aws_security_group" "devops_sg" {
  name        = "devops-project-sg"
  description = "Security group for DevOps project EC2"

  # SSH access (port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ⚠️ In production, restrict to your IP
    description = "SSH access"
  }

  # Frontend - Nginx (port 80)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access for frontend"
  }

  # Backend - Spring Boot (port 8080)
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API access"
  }

  # MySQL Database (port 3306) - Optional, only if external access needed
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # ⚠️ For testing only. In production, remove or restrict
    description = "MySQL database access (optional)"
  }

  # Outbound traffic - Allow all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name    = "devops-project-sg"
    Project = "DevOps-University"
  }
}

# SSH Key Pair
resource "aws_key_pair" "devops_key" {
  key_name   = "devops-key"
  public_key = file("${path.module}/devops-key.pub")

  tags = {
    Name = "devops-key"
  }
}

# EC2 Instance
resource "aws_instance" "devops_server" {
  # Ubuntu 22.04 LTS (Free Tier eligible)
  # Check your region's AMI: https://cloud-images.ubuntu.com/locator/ec2/
  ami           = "ami-0ff91eb5c6fe7cc86"  # Ubuntu 22.04 LTS in ap-south-1 (latest)
  instance_type = "t3.micro"                # Free tier eligible in ap-south-1
  
  key_name               = aws_key_pair.devops_key.key_name
  vpc_security_group_ids = [aws_security_group.devops_sg.id]

  # Root storage
  root_block_device {
    volume_size           = 20  # GB (free tier allows up to 30GB)
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # User data script - runs on first boot
  user_data = <<-EOF
              #!/bin/bash
              hostnamectl set-hostname devops-server
              apt-get update
              apt-get upgrade -y
              EOF

  tags = {
    Name    = "devops-project-server"
    Project = "DevOps-University"
  }
}

# Outputs
output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.devops_server.public_ip
}

output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.devops_server.id
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i devops-key ubuntu@${aws_instance.devops_server.public_ip}"
}

output "frontend_url" {
  description = "Frontend application URL"
  value       = "http://${aws_instance.devops_server.public_ip}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_instance.devops_server.public_ip}:8080"
}
