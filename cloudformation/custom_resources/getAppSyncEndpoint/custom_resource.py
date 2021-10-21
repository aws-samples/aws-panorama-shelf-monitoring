import boto3
import logging
from crhelper import CfnResource

logger = logging.getLogger(__name__)
helper = CfnResource(
    json_logging=False,
    log_level="DEBUG",
    boto_level="CRITICAL",
    sleep_on_delete=120,
    ssl_verify=None,
)

cfn = boto3.client("cloudformation")
amplify = boto3.client("amplify")


def get_appsync_endpoint(appId):
    backend_cfn = amplify.get_backend_environment(appId=appId, environmentName="main")[
        "backendEnvironment"
    ]["stackName"]

    cfn_resources = cfn.describe_stack_resources(StackName=backend_cfn)[
        "StackResources"
    ]

    api_cfn_arn = [
        x["PhysicalResourceId"]
        for x in cfn_resources
        if "api" in x["LogicalResourceId"]
    ][0]

    api_cfn_outputs = cfn.describe_stacks(StackName=api_cfn_arn)["Stacks"][0]["Outputs"]

    gql_endpoint = next(
        (
            item["OutputValue"]
            for item in api_cfn_outputs
            if item["OutputKey"] == "GraphQLAPIEndpointOutput"
        ),
        None,
    )

    helper.Data["endpoint"] = gql_endpoint


@helper.create
@helper.update
def create(event, context):
    appId = event["ResourceProperties"]["AmplifyAppIp"]
    amplify_build_job = amplify.start_job(
        appId=appId, branchName="main", jobType="RELEASE",
    )
    helper.Data["jobId"] = amplify_build_job["jobSummary"]["jobId"]
    helper.Data["appId"] = appId


@helper.poll_create
@helper.poll_update
def poll_create(event, context):
    jobId = helper.Data["jobId"]
    appId = helper.Data["appId"]

    job_status = amplify.get_job(appId=appId, jobId=jobId, branchName="main")["job"][
        "summary"
    ]["status"]

    if job_status == "SUCCEED":
        get_appsync_endpoint(appId)
        return True
    elif job_status in ["PENDING", "PROVISIONING", "RUNNING"]:
        return None
    else:
        raise ValueError(f"Unexpected job status: {job_status}")


@helper.delete
def no_op(_, __):
    """no resources are created in this custom resource, so there
    is nothing to delete"""
    logger.info("Got Delete")


def handler(event, context):
    helper(event, context)
