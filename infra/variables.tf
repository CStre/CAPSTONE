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

variable "twilio_account_sid" {
  description = "Twilio Account SID. Pass via TF_VAR_twilio_account_sid in CI — never commit the value."
  type        = string
  sensitive   = true
}

variable "twilio_auth_token" {
  description = "Twilio Auth Token. Pass via TF_VAR_twilio_auth_token in CI — never commit the value."
  type        = string
  sensitive   = true
}

variable "twilio_from_number" {
  description = "Twilio origination phone number in E.164 format (e.g. +19049439891)."
  type        = string
}

variable "alert_email" {
  description = "Email address for the monthly billing alarm. Defaults to the owner address."
  type        = string
  default     = "collinm.streitman@gmail.com"
}
