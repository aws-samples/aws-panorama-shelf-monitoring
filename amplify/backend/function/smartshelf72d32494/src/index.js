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
const client = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocument.from(client);

// eslint-disable-next-line no-unused-vars
async function sendAlert(bottleCount, _threshold) {
  try {
    const data = await sns.send(
      new PublishCommand({
        TopicArn: process.env.SNS_TOPIC,
        Message: `Only ${bottleCount} bottle(s) left in shelf which is less than threshold you defined. Please refill as soon as possible.`,
        Subject: "Out of Stock Notification",
      })
    );
    console.log("Alert sent successfully!", data);
  } catch (err) {
    console.error("Error sending alert", err);
  }
}

exports.handler = async function (event) {
  //eslint-disable-line
  // console.log(JSON.stringify(event, null, 2));
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

    if (bottleCount <= threshold) {
      // Alert Sending logic...

      if ("OldImage" in record.dynamodb) {
        const oldRecord = unmarshall(record.dynamodb.OldImage);
        if (oldRecord.count !== "undefined" || oldRecord.count != "") {
          if (oldRecord.count != bottleCount) {
            console.log(
              "Sending alert because old bottle count is different than new bottle count"
            );
            await sendAlert(bottleCount, threshold);
          } else {
            console.log(
              "Not sending alert because old bottle count is same as new bottle count and alert has already been sent"
            );
          }
        } else {
          console.log(
            "Sending alert for the first time since bottle count is less than threshold"
          );
          await sendAlert(bottleCount, threshold);
        }
      } else {
        console.log(
          "Sending alert for the first time since bottle count is less than threshold"
        );
        await sendAlert(bottleCount, threshold);
      }
    }

    console.log(record.eventID);
    console.log(record.eventName);
    console.log("DynamoDB Record: %j", record.dynamodb);
  }
};
