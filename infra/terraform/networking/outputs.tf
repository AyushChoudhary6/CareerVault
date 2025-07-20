output "vpc_id" {
    description = "ID of the VPC"
    value       = aws_vpc.careervault_vpc.id
}

output "vpc_cidr_block" {
    description = "CIDR block of the VPC"
    value       = aws_vpc.careervault_vpc.cidr_block
}

output "internet_gateway_id" {
    description = "ID of the Internet Gateway"
    value       = aws_internet_gateway.careervault_igw.id
}

output "public_subnet_1_id" {
    description = "ID of public subnet 1"
    value       = aws_subnet.public_subnet_1.id
}

output "public_subnet_2_id" {
    description = "ID of public subnet 2"
    value       = aws_subnet.public_subnet_2.id
}

output "private_subnet_1_id" {
    description = "ID of private subnet 1"
    value       = aws_subnet.private_subnet_1.id
}

output "private_subnet_2_id" {
    description = "ID of private subnet 2"
    value       = aws_subnet.private_subnet_2.id
}

output "alb_security_group_id" {
    description = "ID of the ALB security group"
    value       = aws_security_group.alb_security_group.id
}

output "backend_security_group_id" {
    description = "ID of the backend security group"
    value       = aws_security_group.backend_security_group.id
}

output "database_security_group_id" {
    description = "ID of the database security group"
    value       = aws_security_group.database_security_group.id
}

output "nat_gateway_1_ip" {
    description = "Elastic IP of NAT Gateway 1"
    value       = aws_eip.nat_gateway_1_eip.public_ip
}

output "nat_gateway_2_ip" {
    description = "Elastic IP of NAT Gateway 2"
    value       = aws_eip.nat_gateway_2_eip.public_ip
}
