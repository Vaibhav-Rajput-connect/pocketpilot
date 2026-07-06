resource "aws_elasticache_subnet_group" "redis_subnet_group" {
  name       = "pocketpilot-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "pocketpilot-redis-${var.environment}"
  description                   = "Redis cluster for session and API caching"
  node_type                     = "cache.t4g.micro"
  port                          = 6379
  
  subnet_group_name             = aws_elasticache_subnet_group.redis_subnet_group.name
  security_group_ids            = [aws_security_group.redis.id]

  automatic_failover_enabled    = false
  multi_az_enabled              = false
  num_cache_clusters            = 1

  engine                        = "redis"
  engine_version                = "7.1"
  parameter_group_name          = "default.redis7"

  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true

  tags = {
    Name = "pocketpilot-redis"
  }
}
