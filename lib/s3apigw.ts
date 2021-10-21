import * as path from 'path';
import * as cdk from '@aws-cdk/core'
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as s3 from '@aws-cdk/aws-s3';

export class S3APIGWStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApi = new apiGateway.RestApi(this, 'RestAPI', {
      deployOptions: {stageName: 'api'},
      defaultCorsPreflightOptions: { 
        allowOrigins: apiGateway.Cors.ALL_ORIGINS,
        allowMethods: apiGateway.Cors.ALL_METHODS,
      }
    });

    const webHostingBucket = new s3.Bucket(this, 'WebHostingBucket', {});
    this.deployFrontEnd(webHostingBucket);
    this.integrateStaticFiles(restApi, webHostingBucket);
  }

  deployFrontEnd(bucket: s3.Bucket) {
    // Deploy the frontend. the assets should be stored in ../frontend/dist beforehand.
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset(`${path.resolve(__dirname)}/../frontend/dist`),
      ],
      destinationBucket: bucket,
      destinationKeyPrefix: 'static' 
    });
  }

  integrateStaticFiles(restApi: apiGateway.RestApi, bucket: s3.Bucket) {
    const restApiRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      path: '/',
    });
    // grant APIGateway to access the bucket
    bucket.grantRead(restApiRole);

    const rscStatic = restApi.root.addResource('static');
    const path1Rsc = rscStatic.addResource('{path1}');
    const path2Rsc = path1Rsc.addResource('{path2}');
    this.integrate(restApiRole, bucket, path1Rsc, '/static/{path1}');
    this.integrate(restApiRole, bucket, path2Rsc, '/static/{path1}/{path2}');
  }

  integrate(restApiRole: iam.Role, bucket: s3.Bucket, rsc: apiGateway.Resource, s3path: string) {
    rsc.addMethod(
      'GET',
      new apiGateway.AwsIntegration({
        service: 's3',
        integrationHttpMethod: 'GET',
        path: `${bucket.bucketName}${s3path}`,
        options: {
          credentialsRole: restApiRole,
          passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_MATCH,
          requestParameters: {
            'integration.request.path.path1': 'method.request.path.path1',
            'integration.request.path.path2': 'method.request.path.path2',
          },
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Timestamp': 'integration.response.header.Date',
                'method.response.header.Content-Length': 'integration.response.header.Content-Length',
                'method.response.header.Content-Type': 'integration.response.header.Content-Type',
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization'",
                'method.response.header.Access-Control-Allow-Methods': "'GET'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
              },
            },
            {
              statusCode: '400',
              selectionPattern: '4\\d{2}',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization'",
                'method.response.header.Access-Control-Allow-Methods': "'GET'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
              },              
            },
            {
              statusCode: '500',
              selectionPattern: '5\\d{2}',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Headers': "'Content-Type,Authorization'",
                'method.response.header.Access-Control-Allow-Methods':  "'GET'",
                'method.response.header.Access-Control-Allow-Origin': "'*'",
              },                  
            },
          ]
        }
      }),
      {
        requestParameters: {
          'method.request.path.path1': true,
          'method.request.path.path2': true,
        },
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Timestamp': true,
              'method.response.header.Content-Length': true,
              'method.response.header.Content-Type': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true,              
            },
          },
          {
            statusCode: '400',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true,              
            },            
          },
          {
            statusCode: '500',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
              'method.response.header.Access-Control-Allow-Origin': true,              
            },            
          },
        ],
      }
    )
  }
}
