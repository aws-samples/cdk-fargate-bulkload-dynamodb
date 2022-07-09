
# cdk_fargate_bulkload_dynamo

# Description

This project creates a Fargate container using CDK / typescript image to bulk load a csv file to DynamoDb from S3.

Installation:

- Install docker-
- Install the aws-cdk cli version 2 from [here](https://docs.aws.amazon.com/cdk/latest/guide/cli.html ) 
- Have an AWS Profile configured in the aws-cli for an account

CDK Setup and Initialization:

```sh
./Cdk_Initialize.sh {AccountNumber} {Region} {Profile}
```

Example:

```sh
sudo chmod +x Cdk_Initialize.sh 
./Cdk_Initialize.sh "99999999999" "us-west-1" "your-aws-profile"
```

# Upload ingestion data from CSV data to S3 bucket

Path /data_docs/bulk_sample.csv
Upload file to S3, and get the bucket name and keys.

# Set the enviroment file for the Fargate container image

Path /worker/.env
Set the dynamodb table name, add fields and their corresponding datatypes
Add the CSV bucket name / object key to enviroment varaible.
Set the REGION

# Deploying Account Stack

Run the following command:

```sh
sudo chmod +x deploy_to_account.sh
./deploy_to_account.sh {AccountNumber} {Region} {Profile}
```

Example:

```sh
./deploy_to_account.sh "99999999999" "us-west-1" "your-aws-profile"
```

This will generate a VPC, Upload the image to ECR, and also create the necessary Fargate Container Definition and other resources that will be needed by our application stack.

# Create DynamoDb table/ set correct WCU on DynamoDb

Remember to create DynamoDb table before running the task, also make sure you provision enough Write capacity units (WCU), for the bulk load to succeed.
In case you want to send data in batches, there is a way to set START_BATCH_NUM, and END_BATCH_NUM enviroment variables in file location
/worker/.env

Note: When you have value END_BATCH_NUM = -1, Fargate task will run till end and load all records.

# Run the task

For instructions on "How to run the ECS Fargate Container from AWS console" click [here](/data_docs/Bulk_load_CSV_file_to_DynamoDb_using_CDK_Fargate_Task.md).

# Clean up

Once Fargate task is complete, you can destroy to the cdk app by running following command.
Example:

```sh
sudo chmod +x cdk_cleanup.sh
./cdk_cleanup.sh
```
