#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3APIGWStack } from '../lib/s3apigw';

const app = new cdk.App();
new S3APIGWStack(app, 'S3APIGWStack', {
});
