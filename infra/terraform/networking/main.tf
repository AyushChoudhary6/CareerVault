provider "aws" {
    region = var.aws_region
}

# VPC for CareerVault application
resource "aws_vpc" "careervault_vpc" {
    cidr_block           = var.vpc_cidr
    enable_dns_hostnames = true
    enable_dns_support   = true

    tags = {
        Name        = "${var.project_name}-VPC"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Internet Gateway
resource "aws_internet_gateway" "careervault_igw" {
    vpc_id = aws_vpc.careervault_vpc.id

    tags = {
        Name        = "${var.project_name}-IGW"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Public Subnets
resource "aws_subnet" "public_subnet_1" {
    vpc_id                  = aws_vpc.careervault_vpc.id
    cidr_block              = var.public_subnet_1_cidr
    availability_zone       = "${var.aws_region}a"
    map_public_ip_on_launch = true

    tags = {
        Name        = "${var.project_name}-Public-Subnet-1"
        Project     = var.project_name
        Environment = var.environment
        Type        = "Public"
    }
}

resource "aws_subnet" "public_subnet_2" {
    vpc_id                  = aws_vpc.careervault_vpc.id
    cidr_block              = var.public_subnet_2_cidr
    availability_zone       = "${var.aws_region}b"
    map_public_ip_on_launch = true

    tags = {
        Name        = "${var.project_name}-Public-Subnet-2"
        Project     = var.project_name
        Environment = var.environment
        Type        = "Public"
    }
}

# Private Subnets
resource "aws_subnet" "private_subnet_1" {
    vpc_id            = aws_vpc.careervault_vpc.id
    cidr_block        = var.private_subnet_1_cidr
    availability_zone = "${var.aws_region}a"

    tags = {
        Name        = "${var.project_name}-Private-Subnet-1"
        Project     = var.project_name
        Environment = var.environment
        Type        = "Private"
    }
}

resource "aws_subnet" "private_subnet_2" {
    vpc_id            = aws_vpc.careervault_vpc.id
    cidr_block        = var.private_subnet_2_cidr
    availability_zone = "${var.aws_region}b"

    tags = {
        Name        = "${var.project_name}-Private-Subnet-2"
        Project     = var.project_name
        Environment = var.environment
        Type        = "Private"
    }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat_gateway_1_eip" {
    domain = "vpc"
    depends_on = [aws_internet_gateway.careervault_igw]

    tags = {
        Name        = "${var.project_name}-NAT-Gateway-1-EIP"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_eip" "nat_gateway_2_eip" {
    domain = "vpc"
    depends_on = [aws_internet_gateway.careervault_igw]

    tags = {
        Name        = "${var.project_name}-NAT-Gateway-2-EIP"
        Project     = var.project_name
        Environment = var.environment
    }
}

# NAT Gateways
resource "aws_nat_gateway" "nat_gateway_1" {
    allocation_id = aws_eip.nat_gateway_1_eip.id
    subnet_id     = aws_subnet.public_subnet_1.id

    tags = {
        Name        = "${var.project_name}-NAT-Gateway-1"
        Project     = var.project_name
        Environment = var.environment
    }

    depends_on = [aws_internet_gateway.careervault_igw]
}

resource "aws_nat_gateway" "nat_gateway_2" {
    allocation_id = aws_eip.nat_gateway_2_eip.id
    subnet_id     = aws_subnet.public_subnet_2.id

    tags = {
        Name        = "${var.project_name}-NAT-Gateway-2"
        Project     = var.project_name
        Environment = var.environment
    }

    depends_on = [aws_internet_gateway.careervault_igw]
}

# Route Tables
resource "aws_route_table" "public_route_table" {
    vpc_id = aws_vpc.careervault_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.careervault_igw.id
    }

    tags = {
        Name        = "${var.project_name}-Public-Route-Table"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_route_table" "private_route_table_1" {
    vpc_id = aws_vpc.careervault_vpc.id

    route {
        cidr_block     = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.nat_gateway_1.id
    }

    tags = {
        Name        = "${var.project_name}-Private-Route-Table-1"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_route_table" "private_route_table_2" {
    vpc_id = aws_vpc.careervault_vpc.id

    route {
        cidr_block     = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.nat_gateway_2.id
    }

    tags = {
        Name        = "${var.project_name}-Private-Route-Table-2"
        Project     = var.project_name
        Environment = var.environment
    }
}

# Route Table Associations
resource "aws_route_table_association" "public_subnet_1_association" {
    subnet_id      = aws_subnet.public_subnet_1.id
    route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
    subnet_id      = aws_subnet.public_subnet_2.id
    route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "private_subnet_1_association" {
    subnet_id      = aws_subnet.private_subnet_1.id
    route_table_id = aws_route_table.private_route_table_1.id
}

resource "aws_route_table_association" "private_subnet_2_association" {
    subnet_id      = aws_subnet.private_subnet_2.id
    route_table_id = aws_route_table.private_route_table_2.id
}

# Security Groups
resource "aws_security_group" "alb_security_group" {
    name_prefix = "${var.project_name}-alb-"
    vpc_id      = aws_vpc.careervault_vpc.id

    # HTTP access from anywhere
    ingress {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    # HTTPS access from anywhere
    ingress {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    # All outbound traffic
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name        = "${var.project_name}-ALB-Security-Group"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_security_group" "backend_security_group" {
    name_prefix = "${var.project_name}-backend-"
    vpc_id      = aws_vpc.careervault_vpc.id

    # HTTP access from ALB
    ingress {
        from_port       = 8000
        to_port         = 8000
        protocol        = "tcp"
        security_groups = [aws_security_group.alb_security_group.id]
    }

    # SSH access (optional - for debugging)
    ingress {
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = [var.vpc_cidr]
    }

    # All outbound traffic
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name        = "${var.project_name}-Backend-Security-Group"
        Project     = var.project_name
        Environment = var.environment
    }
}

resource "aws_security_group" "database_security_group" {
    name_prefix = "${var.project_name}-database-"
    vpc_id      = aws_vpc.careervault_vpc.id

    # MongoDB access from backend
    ingress {
        from_port       = 27017
        to_port         = 27017
        protocol        = "tcp"
        security_groups = [aws_security_group.backend_security_group.id]
    }

    # All outbound traffic
    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    tags = {
        Name        = "${var.project_name}-Database-Security-Group"
        Project     = var.project_name
        Environment = var.environment
    }
}
