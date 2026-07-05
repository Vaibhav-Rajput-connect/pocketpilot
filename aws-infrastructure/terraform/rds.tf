resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "pocketpilot-rds-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "PocketPilot RDS Subnet Group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "pocketpilot-db-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_type           = "gp3"
  
  db_name                = var.db_name
  username               = var.db_username
  # The password will be generated and stored in Secrets Manager, but for initial setup:
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  
  multi_az               = true
  publicly_accessible    = false
  skip_final_snapshot    = false
  final_snapshot_identifier = "pocketpilot-db-final-snapshot"

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  
  performance_insights_enabled = true

  tags = {
    Name = "pocketpilot-rds"
  }
}
