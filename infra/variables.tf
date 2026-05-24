variable "environment" {
  description = "Deployment environment — must be dev, qa, or prod."
  type        = string

  validation {
    condition     = contains(["dev", "qa", "prod"], var.environment)
    error_message = "environment must be one of: dev, qa, prod."
  }
}

variable "unsplash_access_key" {
  description = "Unsplash API client-ID access key. Stored in SSM as a SecureString. Pass via TF_VAR_unsplash_access_key in CI — never commit the value."
  type        = string
  sensitive   = true
}

variable "alert_email" {
  description = "Email address for the monthly billing alarm. Defaults to the owner address."
  type        = string
  default     = "collinm.streitman@gmail.com"
}
