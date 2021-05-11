/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createShelfMonitor = /* GraphQL */ `
  mutation CreateShelfMonitor(
    $input: CreateShelfMonitorInput!
    $condition: ModelshelfMonitorConditionInput
  ) {
    createShelfMonitor(input: $input, condition: $condition) {
      file {
        bucket
        region
        key
      }
      count
      ProductType
      Threshold
      createdAt
      updatedOn
    }
  }
`;
export const updateShelfMonitor = /* GraphQL */ `
  mutation UpdateShelfMonitor(
    $input: UpdateShelfMonitorInput!
    $condition: ModelshelfMonitorConditionInput
  ) {
    updateShelfMonitor(input: $input, condition: $condition) {
      file {
        bucket
        region
        key
      }
      count
      ProductType
      Threshold
      createdAt
      updatedOn
    }
  }
`;
export const deleteShelfMonitor = /* GraphQL */ `
  mutation DeleteShelfMonitor(
    $input: DeleteShelfMonitorInput!
    $condition: ModelshelfMonitorConditionInput
  ) {
    deleteShelfMonitor(input: $input, condition: $condition) {
      file {
        bucket
        region
        key
      }
      count
      ProductType
      Threshold
      createdAt
      updatedOn
    }
  }
`;
