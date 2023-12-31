import gql from 'graphql-tag'

export default function () {
  return gql`
    query FlowVersionGroups {
      versionGroup: flow(distinct_on: [version_group_id]) {
        version_group_id
        id
        name
        project {
          id
          name
        }
      }
    }
  `
}
