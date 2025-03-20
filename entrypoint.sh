#!/bin/bash
# Copy files from S3
aws s3 cp s3://$S3_CONFIG_BUCKET/$S3_CONFIG_PATH/.env ./.env

cd /app/build

node index.js
