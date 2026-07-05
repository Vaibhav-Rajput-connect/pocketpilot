output "alb_dns_name" {
  description = "The DNS name of the ALB"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "The connection endpoint for RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "redis_endpoint" {
  description = "The connection endpoint for ElastiCache Redis"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.app_storage.bucket
}
