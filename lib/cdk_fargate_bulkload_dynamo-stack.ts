import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import  * as iam from 'aws-cdk-lib/aws-iam';
import {FargateWorker} from './FargateWorker'




export class CdkFargateBulkloadDynamoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
      
    // Fargate Cluster and VPC
    const vpc = new ec2.Vpc(this,'Vpc',{maxAzs:1})
    const cluster = new ecs.Cluster(this,'FargateCluster', { vpc })

    // ECS Task Role with access to Table
    const taskRole = new iam.Role(this,'FargateWorkerRole',{
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')      
    })
    taskRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject','dynamodb:DescribeTable','dynamodb:BatchWriteItem','dynamodb:PutItem'],
      effect: iam.Effect.ALLOW,
      resources: ['*']
    }))    

    new FargateWorker(this,'FargateWorker', {
      taskRole: taskRole
    })
    
  }
}
