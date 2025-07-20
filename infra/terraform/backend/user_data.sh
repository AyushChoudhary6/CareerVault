#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install

# Install CloudWatch agent
yum install -y amazon-cloudwatch-agent

# Create application directory
mkdir -p /opt/careervault
cd /opt/careervault

# Create environment file
cat > .env << EOF
GEMINI_API_KEY=${gemini_api_key}
MONGODB_URI=${mongodb_uri}
PORT=8000
ENVIRONMENT=production
EOF

# Create docker-compose.yml for backend only
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: public.ecr.aws/docker/library/python:3.11-slim
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=$${GEMINI_API_KEY}
      - MONGODB_URI=$${MONGODB_URI}
      - PORT=8000
      - ENVIRONMENT=production
    volumes:
      - ./backend:/app
    working_dir: /app
    command: >
      sh -c "
        apt-get update &&
        apt-get install -y build-essential libpq-dev tesseract-ocr tesseract-ocr-eng &&
        pip install --no-cache-dir -r requirements.txt &&
        uvicorn main_mongo:app --host 0.0.0.0 --port 8000
      "
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

# Create a script to deploy backend code
cat > deploy_backend.sh << 'EOF'
#!/bin/bash
cd /opt/careervault

# Create backend directory structure
mkdir -p backend

# This would typically pull from your repository
# For now, we'll create a placeholder
echo "Backend code deployment script"
echo "In production, this would:"
echo "1. Pull the latest code from your repository"
echo "2. Build the Docker image"
echo "3. Start the services"

# Example git pull (uncomment and modify for your repository)
# git clone https://github.com/AyushChoudhary6/CareerVault.git temp
# cp -r temp/backend/* backend/
# rm -rf temp

# Start services
docker-compose up -d

echo "Backend deployment completed"
EOF

chmod +x deploy_backend.sh

# Configure CloudWatch agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/CareerVault/backend",
                        "log_stream_name": "{instance_id}/system"
                    },
                    {
                        "file_path": "/opt/careervault/backend.log",
                        "log_group_name": "/aws/ec2/CareerVault/backend",
                        "log_stream_name": "{instance_id}/application"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "CareerVault/Backend",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": [
                    "used_percent"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "diskio": {
                "measurement": [
                    "io_time"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s

# Create a systemd service for the application
cat > /etc/systemd/system/careervault-backend.service << EOF
[Unit]
Description=CareerVault Backend Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/careervault
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable careervault-backend.service

echo "Backend server setup completed. Use /opt/careervault/deploy_backend.sh to deploy your application."
