from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport
from requests_aws4auth import AWS4Auth
from os import getenv

import logging
logging.basicConfig()
logger = logging.getLogger('gqllayer')
logger.setLevel('INFO')


class BackendGqlClass:

    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

        # get temporary creds from lambda env
        awsauth = AWS4Auth(
            getenv('AWS_ACCESS_KEY_ID'),
            getenv('AWS_SECRET_ACCESS_KEY'),
            getenv('AWS_REGION'),
            'appsync',
            session_token=getenv('AWS_SESSION_TOKEN')
        )

        headers = {
            'Content-Type': 'application/json'
        }

        appsync_endpoint = getenv('APPSYNC_ENDPOINT')

        job_import_transport = RequestsHTTPTransport(
            url=appsync_endpoint,
            use_json=True,
            headers=headers,
            verify=True,
            retries=3,
            auth=awsauth
        )

        self._client = Client(
            transport=job_import_transport,
            fetch_schema_from_transport=True
        )

    def client(self):
        return self._client

    def return_gql(self, gql_string):
        return gql(gql_string)
