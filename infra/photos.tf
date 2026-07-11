# ---------------------------------------------------------------------------
# Travel photo pool — SHARED, account-global bucket.
# The bucket itself (and its policy) is created once in `bootstrap/`; the photos
# are identical across environments, so we never triplicate them. Here we only
# look it up, to wire it as a CloudFront origin (see frontend.tf, `/photos/*`).
# Populated out-of-band by `backend: PHOTO_S3_BUCKET=bba-photos npm run sync:photos`.
# ---------------------------------------------------------------------------

data "aws_s3_bucket" "photos" {
  bucket = "bba-photos"
}
