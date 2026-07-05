resource "random_string" "s3_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket" "app_storage" {
  bucket = "pocketpilot-storage-${var.environment}-${random_string.s3_suffix.result}"
}

resource "aws_s3_bucket_public_access_block" "app_storage_block" {
  bucket = aws_s3_bucket.app_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage_crypto" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_cors_configuration" "app_storage_cors" {
  bucket = aws_s3_bucket.app_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "app_storage_lifecycle" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    id     = "expire_old_temp_files"
    status = "Enabled"

    filter {
      prefix = "temp/"
    }

    expiration {
      days = 7
    }
  }
}
