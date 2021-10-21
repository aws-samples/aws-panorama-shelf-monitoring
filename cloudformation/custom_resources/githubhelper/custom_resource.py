import boto3
import logging
from github import Github
from crhelper import CfnResource


logger = logging.getLogger(__name__)
helper = CfnResource(
    json_logging=False,
    log_level="DEBUG",
    boto_level="CRITICAL",
    sleep_on_delete=120,
    ssl_verify=None,
)

secrets = boto3.client("secretsmanager")


@helper.create
@helper.update
def create(event, context):
    # DO NOT LOG
    github_token = secrets.get_secret_value(SecretId=event['ResourceProperties']['TokenSecretName'])['SecretString']
    g = Github(github_token)
    user = g.get_user()
    url = str(event['ResourceProperties']["sourceRepo"]).replace("https://github.com/", "").split("/")
    repo = g.get_repo(f'{url[0]}/{url[1]}')
    logger.info("Forking the blog source repo...")
    my_fork = user.create_fork(repo)
    amplify_clone_url = f"https://github.com/{user.login}/{my_fork.name}"
    helper.Data["cloneUrl"] = amplify_clone_url


@helper.delete
def no_op(_, __):
    """no resources are created in this custom resource, so there
    is nothing to delete"""
    logger.info("Got Delete")


def handler(event, context):
    helper(event, context)
