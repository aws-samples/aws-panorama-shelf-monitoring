import boto3
import json
from gqllayer import BackendGqlClass

gql_resource = BackendGqlClass()
gql_client = gql_resource.client()


gql_query = """
mutation MyMutation($s3Uri: String, $ProductType: ProductType = BOTTLE, $count: Int) {
  updateShelfMonitor(input: {s3Uri: $s3Uri, ProductType: $ProductType, count: $count}) {
      count
      Threshold
      s3Uri
      ProductType
      createdAt
      updatedOn
  }
}
"""

s3 = boto3.client("s3")


def handler(event, context):
    for record in event["Records"]:
        payload = json.loads(record["body"])
        product_type = payload["ProductType"]
        product_count = payload["StockCount"]
        bucket, key = payload["S3Uri"].replace("s3://", "").split("/", 1)

        presigned_url = s3.generate_presigned_url(
            "get_object", Params={"Bucket": bucket, "Key": key}, ExpiresIn=3600
        )

        values = {"s3Uri": presigned_url, "count": product_count}

        mutation = gql_client.execute(
            gql_resource.return_gql(gql_query), variable_values=values
        )
        print(mutation)
    return
