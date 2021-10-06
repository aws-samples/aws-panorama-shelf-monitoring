/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
/* eslint-disable new-cap */
/* eslint-disable no-console */
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.AWS_REGION;
const sns = new SNSClient({ region: REGION });
const client = new DynamoDBClient({region: REGION});
const ddbDocClient = DynamoDBDocument.from(client);
const delay = process.env.DELAY || 10;

async function sendAlert(bottleCount, threshold) {
  try {
    const data = await sns.send(new PublishCommand({
      TopicArn: process.env.SNS_TOPIC,
      Message: `The item count is currently ${bottleCount}, and the alert threshold is set to ${threshold}. Please restock as soon as possible.`
    }));
    console.log("Alert sent successfully!", data);
  } catch (err) {
    console.error("Error sending alert", err);
  }
};

async function saveAlertTime(tableName, now) {
  const params = {
    TableName: tableName,
    Key: {
      "ProductType": "BOTTLE",
    },
    UpdateExpression: "set lastNotificationSent = :a",
    ExpressionAttributeValues: {
      ":a": now,
    },
  };

  try {
    const data = await ddbDocClient.update(params);
    console.log("Alert time saved successfully!", data);
  } catch (err) {
    console.error("Error saving alert time", err);
  };
};

exports.handler = async function (event) {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  for (const record of event.Records) {
    const newRecord = unmarshall(record.dynamodb.NewImage);
    if ("OldImage" in record.dynamodb) {
      const oldRecord = unmarshall(record.dynamodb.OldImage);
      if (oldRecord.Threshold !== newRecord.Threshold) {
        console.log("Nothing new, just updating the threshold...");
        return;
      }
    }
    const tableName = record.eventSourceARN.split("/")[1];
    
    const bottleCount = newRecord.count;
    const threshold = newRecord.Threshold;


    if (bottleCount === 9000) {
      // magic count value when updating a threshold.
      return;
    }

    /* TODO: don't send alert if
    notification was sent <10 mins ago and if threshold hasn't changed */
    if (bottleCount <= threshold) {
      if (newRecord.lastNotificationSent) {
        const lastNotificationTime = new Date(newRecord.lastNotificationSent);
        const now = new Date.now();
        const diff = now - lastNotificationTime;
        const diffMinutes = diff / 1000 / 60;
        if (diffMinutes < delay) {
          console.log("Not sending alert because it was sent less than 10 minutes ago");
        } else {
          console.log("Sending alert because it was sent more than 10 minutes ago");
          await sendAlert(bottleCount, threshold);
          await saveAlertTime(tableName, now);
        }
      } else {
        const now = Date.now();
        console.log("Sending alert because it was never sent");
        await sendAlert(bottleCount, threshold);
        await saveAlertTime(tableName, now);
      }
    };

    console.log(record.eventID);
    console.log(record.eventName);
    console.log("DynamoDB Record: %j", record.dynamodb);
  };
};
