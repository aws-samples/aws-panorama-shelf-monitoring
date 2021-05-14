/* eslint-disable no-console */
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const REGION = process.env.AWS_REGION;
const sns = new SNSClient({ region: REGION });


const sendAlert = async () => {
  try {
    const data = await sns.send(new PublishCommand({
      TopicArn: process.env.SNS_TOPIC,
      Message: "The bottle shelf is low. Please restock ASAP."
    }))
    console.log("Message send successfully!", data);
  } catch (err) {
    console.error(err, err.stack);
  }
}

exports.handler = event => {
  //eslint-disable-line
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach(record => {
    const newRecord = unmarshall(record.dynamodb.NewImage);
    const oldRecord = unmarshall(record.dynamodb.OldImage);

    if (oldRecord.Threshold !== newRecord.Threshold) {
      console.log("Nothing new, just updating the threshold...");
      return;
    }

    const bottleCount = newRecord.count;
    const threshold = newRecord.Threshold;

    if (bottleCount <= threshold) {
      sendAlert();
    } else {
      return;
    }

    console.log(record.eventID);
    console.log(record.eventName);
    console.log("DynamoDB Record: %j", record.dynamodb);
  });
  return Promise.resolve("Successfully processed DynamoDB record");
};
