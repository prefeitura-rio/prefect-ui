import gql from 'graphql-tag'

export default function () {
  return gql`
    query DataToClear {
      project {
        id
      }

      flow(distinct_on: version_group_id, where: { archived: { _eq: false } }) {
        id
      }
    }
  `
}
