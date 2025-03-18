#!/bin/bash
# Copy files from S3
aws s3 cp s3://$ENV_FILE_BUCKET/.env ./.env

cd /app/build

node index.js
