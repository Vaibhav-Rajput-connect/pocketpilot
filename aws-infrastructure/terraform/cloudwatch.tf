resource "aws_cloudwatch_log_group" "backend_logs" {
  name              = "/ecs/pocketpilot-backend-${var.environment}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "nginx_logs" {
  name              = "/ecs/pocketpilot-nginx-${var.environment}"
  retention_in_days = 30
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "PocketPilot-Dashboard-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ALB Request Count"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "AutoScalingGroupName", aws_autoscaling_group.main.name]
          ]
          view    = "timeSeries"
          stacked = false
          region  = var.aws_region
          title   = "ASG Average CPU Utilization"
        }
      }
    ]
  })
}
