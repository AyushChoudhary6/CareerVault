#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install MongoDB
cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-7.0.asc
EOF

yum install -y mongodb-org

# Configure MongoDB
mkdir -p /data/db
chown -R mongod:mongod /data/db

# Configure MongoDB to bind to all interfaces
sed -i 's/bindIp: 127.0.0.1/bindIp: 0.0.0.0/' /etc/mongod.conf

# Start MongoDB
systemctl start mongod
systemctl enable mongod

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install

# Install CloudWatch agent
yum install -y amazon-cloudwatch-agent

# Configure CloudWatch agent for MongoDB
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/mongodb/mongod.log",
                        "log_group_name": "/aws/ec2/CareerVault/mongodb",
                        "log_stream_name": "{instance_id}/mongodb"
                    },
                    {
                        "file_path": "/var/log/messages",
                        "log_group_name": "/aws/ec2/CareerVault/mongodb",
                        "log_stream_name": "{instance_id}/system"
                    }
                ]
            }
        }
    },
    "metrics": {
        "namespace": "CareerVault/MongoDB",
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

# Create MongoDB initialization script
cat > /home/ec2-user/init_mongodb.js << 'EOF'
// Use the careervault database
use careervault

// Create a jobs collection with some initial data structure
db.jobs.createIndex({ "userId": 1 })
db.jobs.createIndex({ "createdAt": -1 })
db.jobs.createIndex({ "status": 1 })

// Create a users collection with indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })

print("CareerVault database initialized successfully!")
EOF

# Wait for MongoDB to be ready and initialize
sleep 30
mongosh --file /home/ec2-user/init_mongodb.js

# Create backup script
cat > /home/ec2-user/backup_mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/ec2-user/mongodb_backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Create backup
mongodump --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;

echo "MongoDB backup completed: $BACKUP_DIR/backup_$DATE"
EOF

chmod +x /home/ec2-user/backup_mongodb.sh

# Add backup to cron (daily at 2 AM)
echo "0 2 * * * /home/ec2-user/backup_mongodb.sh" | crontab -

echo "MongoDB setup completed successfully!"
