# Simple S3-only hosting (alternative if CloudFront permissions are not available)
# Uncomment this section and comment out the CloudFront distribution if needed

# resource "aws_s3_bucket_policy" "frontend_policy_public" {
#     bucket = aws_s3_bucket.frontend_bucket.id
#     policy = data.aws_iam_policy_document.frontend_policy_public.json
# 
#     depends_on = [aws_s3_bucket_public_access_block.frontend_pab]
# }
# 
# data "aws_iam_policy_document" "frontend_policy_public" {
#     statement {
#         actions   = ["s3:GetObject"]
#         resources = ["${aws_s3_bucket.frontend_bucket.arn}/*"]
# 
#         principals {
#             type        = "*"
#             identifiers = ["*"]
#         }
#     }
# }
