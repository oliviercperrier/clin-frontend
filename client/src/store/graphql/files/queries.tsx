// TODO

import { gql } from '@apollo/client';

export const FILES_QUERY = gql`
  {
    study {
      hits {
        edges {
          node {
            kf_id
            name
            domain
            score
            code
            family_count
            file_count
          }
        }
      }
    }
  }
`;
