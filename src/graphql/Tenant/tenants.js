import gql from 'graphql-tag'

export default function () {
  return gql`
    query Tenants {
      tenant {
        id
        created
        name
        info
        settings
        slug
      }
    }
  `
}
