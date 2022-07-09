import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs'
import  * as iam from 'aws-cdk-lib/aws-iam';

type FargateWorkerProps = {
    readonly taskRole: iam.Role
}

export class FargateWorker extends Construct{
    readonly _taskDefinition: ecs.TaskDefinition
    readonly _container: ecs.ContainerDefinition

    constructor(scope: Construct, id:string, props: FargateWorkerProps) {
        super(scope,id)

        this._taskDefinition = new ecs.FargateTaskDefinition(this,'FargateTaskDef',{
            taskRole: props.taskRole,
            memoryLimitMiB: 1024
        } )

        this._container = new ecs.ContainerDefinition(this,'FargateContainerDef', {
            taskDefinition: this._taskDefinition,
            image: ecs.ContainerImage.fromAsset('./worker'),
            logging: ecs.LogDriver.awsLogs({
                streamPrefix: 'FargateDynamoBulkLoadLogs'
            })
            
        })


    }

    public get taskDefinition(): ecs.TaskDefinition{
        return this._taskDefinition;
    }
    public get container(): ecs.ContainerDefinition{
        return this._container
    }
}