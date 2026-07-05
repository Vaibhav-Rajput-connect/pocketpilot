resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "pocketpilot-secrets-${var.environment}"
  description = "Secrets for PocketPilot backend (JWT, API keys)"
}

# The actual secret values will be populated via AWS Console or CLI to avoid storing them in plaintext in Terraform state.
# We create a placeholder initial value.
resource "aws_secretsmanager_secret_version" "app_secrets_initial" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    JWT_SECRET_KEY = "placeholder-change-me"
    GEMINI_API_KEY = "placeholder-change-me"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
