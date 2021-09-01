import { useLazyResultQuery } from 'store/graphql/utils/query';
import { FilesResult } from 'store/graphql/files/models';
import { FILES_QUERY } from './queries';

export const getFilesData = () => () => {
  const { loading, result } = useLazyResultQuery<any>(FILES_QUERY, {
    variables: [],
  });

  return {
    loading,
    results: result?.study.hits.edges.map((edge: { node: FilesResult }) => ({
      ...edge.node,
    })),
  };
};
