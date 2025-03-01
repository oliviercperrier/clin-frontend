/* eslint-disable no-param-reassign, no-underscore-dangle */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import head from 'lodash/head';
import intl from 'react-intl-universal';
import { v1 as uuidv1 } from 'uuid';

import * as actions from '../actions/type';
import { normalizePatientDetails } from '../helpers/struct.ts';
import { INSTRUCTION_TYPE_SUBQUERY } from '../components/Query/Subquery';
import { sanitizeInstructions } from '../components/Query/helpers/query';

import {
  LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_KEY,
  LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_ORDER_KEY,
  PATIENT_VARIANT_STORAGE_KEY,
  defaultUserVariantColumns,
  defaultUserVariantColumnsOrder,
} from '../helpers/search_table_helper.ts';
import { ClinStorage } from '../helpers/clin_storage';

const MAX_REVISIONS = 10;

export const initialVariantState = {
  schema: {},
  activePatient: null,
  activeQuery: null,
  originalQueries: [],
  draftQueries: [],
  draftHistory: [],
  results: {},
  facets: {},
  statements: {},
  statementsFetched: false,
  statementsFetching: false,
  statementsError: null,
  activeStatementId: null,
  defaultStatement: null,
  activeStatementTotals: {},
  geneResult: [],
  columns: [],
  columnsOrder: [],
};

// @TODO
export const variantShape = {
  schema: PropTypes.shape({}),
  activePatient: PropTypes.String,
  activeQuery: PropTypes.String,
  originalQueries: PropTypes.array,
  draftQueries: PropTypes.array,
  draftHistory: PropTypes.array,
  results: PropTypes.shape({}),
  facets: PropTypes.shape({}),
  statements: PropTypes.shape({}),
  activeStatementId: PropTypes.String,
  defaultStatement: PropTypes.String,
  activeStatementTotals: PropTypes.shape({}),
  geneResult: PropTypes.array,
  columns: PropTypes.array,
  columnsOrder: PropTypes.array,
};

export const DRAFT_STATEMENT_UID = 'draft';

const intlKeys = {
  defaultTitle: 'screen.patientvariant.modal.statement.save.input.title.default',
};

const createNewQuery = (
  title = intl.get('screen.patientvariant.query.title.increment', { count: 1 }),
  key = uuidv1(),
  instructions = [],
) => ({
  key,
  title,
  instructions,
});

const createDraftStatement = (title, description = '', queries = null) => ({
  uid: DRAFT_STATEMENT_UID,
  title,
  description,
  queries: queries || [createNewQuery()],
});

const retrieveColumns = () => ClinStorage.getArray(LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_KEY, defaultUserVariantColumns,
  [
    (columns) => columns.some((str) => !str.startsWith(PATIENT_VARIANT_STORAGE_KEY)),
  ]);

const retrieveColumnsOrder = () => {
  const columnsOrder = window.localStorage.getItem(LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_ORDER_KEY);
  if (columnsOrder != null) {
    return JSON.parse(columnsOrder);
  }
  return defaultUserVariantColumnsOrder;
};

const variantReducer = (state = ({ ...initialVariantState }), action) => produce(state, (draft) => {
  const { draftQueries, draftHistory } = draft;
  const { payload } = action;
  switch (action.type) {
    case actions.USER_LOGOUT_SUCCEEDED:
      draft = { ...initialVariantState };
      break;

    case actions.USER_PROFILE_SUCCEEDED: {
      const { defaultStatement } = action.payload.data.hits[0]._source;
      draft.activeStatementId = defaultStatement;
      draft.defaultStatement = defaultStatement;
      break;
    }

    case actions.VARIANT_SCHEMA_SUCCEEDED:
      draft.schema = action.payload.data;
      break;

    case actions.PATIENT_FETCH_SUCCEEDED: {
      draft.columns = retrieveColumns();
      draft.columnsOrder = retrieveColumnsOrder();
      const details = normalizePatientDetails(action.payload.patientData);
      draft.activePatient = details.id;
      draft.originalQueries = [{
        key: uuidv1(),
        instructions: [],
      }];
      draft.draftQueries = cloneDeep(draft.originalQueries);
      draft.activeQuery = draft.originalQueries[0].key;
      break;
    }

    case actions.PATIENT_VARIANT_QUERY_SELECTION:
      if (action.payload.key) {
        draft.activeQuery = action.payload.key;
      }
      break;

    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
      draft.results[action.payload.data.query] = action.payload.data.hits;
      break;

    case actions.PATIENT_VARIANT_FACET_SUCCEEDED:
      draft.facets[action.payload.data.query] = action.payload.data.facets;
      break;

    case actions.PATIENT_VARIANT_COUNT_SUCCEEDED:
      Object.keys(action.payload.data.total).forEach((key) => {
        draft.activeStatementTotals[key] = action.payload.data.total[key];
      });
      break;

    case actions.PATIENT_VARIANT_QUERY_REMOVAL:
      if (draft.draftQueries.length > 1) {
        draft.draftQueries = draft.draftQueries.filter((query) => action.payload.keys.indexOf(query.key) === -1);
        // @NOTE Remove matching subquery instructions
        const filteredDrafts = draft.draftQueries.map((draftQuery) => {
          const filteredInstructions = draftQuery.instructions.filter(
            (instruction) => !(instruction.type === INSTRUCTION_TYPE_SUBQUERY
                && action.payload.keys.indexOf(instruction.data.query) !== -1),
          );
          draftQuery.instructions = sanitizeInstructions(filteredInstructions);
          return draftQuery;
        });
        draft.draftQueries = filteredDrafts;
        draft.activeQuery = last(draft.draftQueries).key;
      } else {
        const newStatement = createDraftStatement(intl.get(`${intlKeys.defaultTitle}`));
        draft.statements[draft.activeStatementId].queries = newStatement.queries;
        draft.activeQuery = head(newStatement.queries).key;
        draft.draftQueries = newStatement.queries;
        draft.draftHistory = [];
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_DUPLICATION:
      if (action.payload.query) {
        const keyToDuplicate = action.payload.query.key;
        const indexToInsertAt = action.payload.index || draft.draftQueries.length;
        const indexToDuplicate = findIndex(draft.draftQueries, { key: keyToDuplicate });
        if (indexToDuplicate) {
          draft.draftQueries.splice(indexToInsertAt, 0, action.payload.query);
          draft.activeQuery = action.payload.query.key;
          draft.activeStatementTotals[keyToDuplicate] = action.payload.count;
        }
      }
      break;

    case actions.PATIENT_VARIANT_QUERY_CREATION_SUCCEEDED:
      draft.draftQueries.push(
        createNewQuery(
          intl.get('screen.patientvariant.query.title.increment', { count: draft.draftQueries.length + 1 }),
        ),
      );
      break;

    case actions.PATIENT_VARIANT_QUERY_REPLACEMENT:
      const { query } = action.payload; // eslint-disable-line no-case-declarations
      const index = findIndex(draftQueries, { key: query.key }); // eslint-disable-line no-case-declarations
      if (index > -1) {
        draftQueries[index] = query;
      } else {
        draftQueries.push(query);
      }
      draft.draftQueries = draftQueries;
      break;

    case actions.PATIENT_VARIANT_QUERIES_REPLACEMENT:
      draft.draftQueries = action.payload.queries;
      break;

    case actions.PATIENT_VARIANT_SET_ACTIVE_STATEMENT:
      draft.activeStatementId = action.payload;
      break;

    case actions.PATIENT_VARIANT_STATEMENT_SORT:
      draft.draftQueries = action.payload.statement;
      break;

    case actions.PATIENT_VARIANT_COMMIT_HISTORY:
      const newCommit = { // eslint-disable-line no-case-declarations
        activeQuery: draft.activeQuery,
        draftQueries: action.payload.version,
      };
      if (!isEqual(newCommit, last(draftHistory))) {
        draftHistory.push(newCommit);
      }
      if (draftHistory.length > MAX_REVISIONS) {
        draftHistory.shift();
      }
      break;

    case actions.PATIENT_VARIANT_UNDO:
      const lastVersion = draftHistory.pop(); // eslint-disable-line no-case-declarations
      draft.draftQueries = lastVersion.draftQueries;
      draft.activeQuery = lastVersion.activeQuery;
      break;
    
    case actions.PATIENT_VARIANT_GET_STATEMENTS_REQUESTED:
      draft.statementsFetching = true
      break;

    case actions.PATIENT_VARIANT_GET_STATEMENTS_SUCCEEDED:
      // @NOTE Normalize and update with retrieved statements
      action.payload.data.hits.forEach((hit) => {
        draft.statements[hit._id] = {
          uid: hit._id,
          title: hit._source.title,
          description: hit._source.description,
          queries: JSON.parse(hit._source.queries),
        };
      });

      // eslint-disable-next-line no-case-declarations
      const doesDefaultStatementExist = state.defaultStatement && draft.statements[state.defaultStatement];
      // eslint-disable-next-line no-case-declarations
      const wasAStatementSelected = state.activeStatementId
        && state.activeStatementId !== DRAFT_STATEMENT_UID && draft.statements[state.activeStatementId];

      if (!doesDefaultStatementExist && !wasAStatementSelected) {
        // @NOTE Don't override draft if one exists
        if (!draft.statements[DRAFT_STATEMENT_UID]) {
          draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(intl.get(`${intlKeys.defaultTitle}`));
          draft.activeQuery = head(draft.statements[DRAFT_STATEMENT_UID].queries).key;
          draft.originalQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
          draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
          draft.draftHistory = [];
        }
        draft.activeStatementId = DRAFT_STATEMENT_UID;
      } else {
        const activeStatementId = state.activeStatementId ? state.activeStatementId : state.defaultStatement;
        draft.activeStatementId = activeStatementId;
        draft.activeQuery = head(draft.statements[activeStatementId].queries).key;
        draft.originalQueries = draft.statements[activeStatementId].queries;
        draft.draftQueries = draft.statements[activeStatementId].queries;
        draft.draftHistory = [];
      }

      draft.statementsFetched = true
      draft.statementsFetching = false
      draft.statementsError = null

      break;
    
    case actions.PATIENT_VARIANT_GET_STATEMENTS_FAILED:
      draft.statementsError = action.payload
      draft.statementsFetching = false
      break;

    case actions.PATIENT_VARIANT_SELECT_STATEMENT_SUCCEEDED:
      delete draft.statements.draft;
      draft.activeStatementId = action.payload.uid;
      draft.activeQuery = last(draft.statements[action.payload.uid].queries).key;
      draft.originalQueries = draft.statements[action.payload.uid].queries;
      draft.draftQueries = draft.statements[action.payload.uid].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_UPDATE_STATEMENT_SUCCEEDED:
      const updatedStatement = { // eslint-disable-line no-case-declarations
        uid: action.payload.data.uid,
        title: action.payload.data.title,
        description: action.payload.data.description,
        queries: JSON.parse(action.payload.data.queries),
      };
      draft.statements[updatedStatement.uid] = updatedStatement;
      if (state.activeStatementId === updatedStatement.uid) {
        draft.draftQueries = updatedStatement.queries;
        draft.originalQueries = updatedStatement.queries;
        draft.draftHistory = [];
      }
      break;

    case actions.PATIENT_VARIANT_CREATE_STATEMENT_SUCCEEDED:
      delete draft.statements.draft;
      const createdStatement = { // eslint-disable-line no-case-declarations
        uid: action.payload.data.uid,
        title: action.payload.data.title,
        description: action.payload.data.description,
        queries: JSON.parse(action.payload.data.queries),
      };
      draft.statements[createdStatement.uid] = createdStatement;
      draft.activeStatementId = createdStatement.uid;
      draft.originalQueries = cloneDeep(createdStatement.queries);
      draft.draftQueries = cloneDeep(createdStatement.queries);
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DUPLICATE_STATEMENT_SUCCEEDED:
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(
        payload.statement.title,
        payload.statement.description,
        payload.statement.queries,
      );
      draft.activeQuery = last(draft.statements[DRAFT_STATEMENT_UID].queries).key;
      draft.originalQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;

    case actions.PATIENT_VARIANT_DELETE_STATEMENT_SUCCEEDED:
      delete draft.statements[action.payload.uid];
    case actions.PATIENT_VARIANT_CREATE_DRAFT_STATEMENT: // eslint-disable-line no-fallthrough
      draft.activeStatementId = DRAFT_STATEMENT_UID;
      if (payload.statement) {
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(
          payload.statement.title,
        );
      } else {
        draft.statements[DRAFT_STATEMENT_UID] = createDraftStatement(intl.get(`${intlKeys.defaultTitle}`));
      }
      draft.activeQuery = head(draft.statements[DRAFT_STATEMENT_UID].queries).key;
      draft.originalQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftQueries = draft.statements[DRAFT_STATEMENT_UID].queries;
      draft.draftHistory = [];
      break;
    case 'PATIENT_VARIANT_FETCH_GENES_BY_AUTOCOMPLETE_SUCCEEDED':
      draft.geneResult = action.payload.data;
      break;

    case actions.PATIENT_VARIANT_UPDATE_COLUMNS:
      window.localStorage.setItem(LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_KEY, action.payload.columns.join(','));
      draft.columns = action.payload.columns;
      break;

    case actions.PATIENT_VARIANT_UPDATE_COLUMNS_ORDER:
      window.localStorage.setItem(
        LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_ORDER_KEY,
        JSON.stringify(action.payload.columnsOrder),
      );
      draft.columnsOrder = action.payload.columnsOrder;
      break;

    case actions.PATIENT_VARIANT_RESET_COLUMNS:
      window.localStorage.removeItem(LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_KEY);
      window.localStorage.removeItem(LOCAL_STORAGE_PATIENT_VARIANT_COLUMNS_ORDER_KEY);
      draft.columns = retrieveColumns();
      draft.columnsOrder = retrieveColumnsOrder();
      break;

    default:
      break;
  }
});

export default variantReducer;
