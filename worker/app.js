import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDB, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { parseStream } from 'fast-csv';
import { config } from 'dotenv';
import sleep from 'thread-sleep';
config({
    // path: '/worker',
    debug: true,
});
const dynamoTable = String(process.env.DYNAMODB_TABLE_NAME);
const dynamoFields = JSON.parse(String(process.env.DYNAMODB_FIELDS));
const s3client = new S3Client({ region: process.env.REGION });
const dbclient = new DynamoDB({ region: process.env.REGION });
let batchNumber = 0;
const startBatch = parseInt(process.env.START_BATCH_NUM || "0");
const stopBatch = parseInt(process.env.END_BATCH_NUM || "-1");
let csvItems = [];
const run = async (params) => {
    try {
        const { Body } = await s3client.send(new GetObjectCommand({
            Bucket: process.env.S3_CSV_BUCKET,
            Key: process.env.S3_CSV_BUCKET_KEY //your S3 bucket key
        }));
        const dataStream = Body;
        console.log('Retriving data from S3....bucket ${Bucket}');
        let parserFcn = new Promise((resolve, reject) => {
            const csvStream = parseStream(dataStream, { headers: true })
                .on("data", async (row) => {
                try {
                    if (batchNumber === stopBatch) {
                        process.exit(1);
                    }
                    csvStream.pause();
                    await populateFieldsFromCsv(row);
                }
                finally {
                    csvStream.resume();
                }
            })
                .on("end", function () {
                console.log("csv parse process finished for rows");
                resolve('');
            })
                .on("error", function () {
                console.log("csv parse process failed");
                reject();
            });
        });
        await parserFcn;
        console.log('-------------------- Done -------------------------------------------');
    }
    catch (error) {
        console.error(error);
    }
};
const populateFieldsFromCsv = async (fields) => {
    let items = {};
    for (const [k, v] of Object.entries(dynamoFields)) {
        items[k] = { [v]: fields[k] };
    }
    let row = {
        PutRequest: {
            Item: items
        }
    };
    csvItems.push(row);
    console.log(`CsvItems.length AFTER Pushing a row ----------------- --> ${csvItems.length}`);
    if (csvItems.length >= 20) {
        console.log(`CsvItems.length greater then 20`);
        let proceed = true;
        if ((startBatch <= batchNumber) && (stopBatch === -1)) {
            proceed = true;
        }
        else {
            if ((startBatch <= batchNumber) && (batchNumber < stopBatch)) {
                proceed = true;
            }
            else {
                proceed = false;
            }
        }
        console.log(`startBatch=>${startBatch}   batchNumber=>${batchNumber}  stopBatch=>${stopBatch}  proceed=>${proceed}`);
        batchNumber++;
        if (proceed) {
            const localBatchItem = batchNumber;
            updateDynamoDBBatch(csvItems, localBatchItem);
        }
        else {
            console.log(`########### Batch # ${batchNumber} Not executed  ########### `);
        }
        csvItems = [];
        sleep(500);
    }
    // else {
    //     console.log(`CsvItems.length less than 20`)
    //     updateDynamoDBBatch(csvItems)
    // }
};
const updateDynamoDBBatch = async (csvItems, localBatchItem = 0) => {
    const items = [...csvItems];
    const dynamoDbParams = {
        RequestItems: {
            [dynamoTable]: items
        },
    };
    console.log(JSON.stringify(dynamoDbParams));
    try {
        const data = await dbclient.send(new BatchWriteItemCommand(dynamoDbParams));
        console.log(`Sent batch # ${localBatchItem} to Dynamo  returned data --> ${JSON.stringify(data)} <---- returned data--------`);
    }
    catch (error) {
        console.log(`Dynamo db error on batch # ${localBatchItem} to Dynamo --- response ERROR -- ${error} <---- ERROR-------`);
    }
};
run({});
//# sourceMappingURL=app.js.map