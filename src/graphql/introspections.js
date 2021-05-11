/* eslint-disable import/prefer-default-export */
export const getThresholds = /* GraphQL */ `
    query introspectTaskStateEnumType {
        __type(name: "TaskStateEnum") {
        enumValues {
            name
        }
        }
    }
    `;
