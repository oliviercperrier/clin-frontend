import * as actions from './type';


// eslint-disable-next-line import/prefer-default-export
export const savePatientSubmission = patientSubmission => ({
  type: actions.PATIENT_SUBMISSION_SAVE_REQUESTED,
  payload: patientSubmission,
});

export const savePatientLocal = patient => ({
  type: actions.PATIENT_SUBMISSION_LOCAL_SAVE_REQUESTED,
  payload: patient,
});

export const saveObservations = observations => ({
  type: actions.PATIENT_SUBMISSION_OBSERVATIONS_SAVE_REQUESTED,
  payload: observations,
});

export const saveServiceRequest = code => ({
  type: actions.PATIENT_SUBMISSION_SERVICE_REQUEST_SAVE_REQUESTED,
  payload: {
    code,
  },
});

export const saveLocalCgh = (interpretation, precision) => ({
  type: actions.PATIENT_SUBMISSION_LOCAL_CGH_SAVE_REQUESTED,
  payload: {
    interpretation,
    precision,
  },
});

export const saveLocalSummary = summary => ({
  type: actions.PATIENT_SUBMISSION_LOCAL_SUMMARY_SAVE_REQUESTED,
  payload: {
    summary,
  },
});


export const saveLocalIndic = indic => ({
  type: actions.PATIENT_SUBMISSION_LOCAL_INDIC_SAVE_REQUESTED,
  payload: {
    indic,
  },
});


export const addHpoResource = resource => ({
  type: actions.PATIENT_SUBMISSION_ADD_HPO_RESOURCE,
  payload: resource,
});

export const updateHpoNote = (note, index) => ({
  type: actions.PATIENT_SUBMISSION_UPDATE_HPO_NOTE,
  payload: {
    note,
    index,
  },
});

export const updateHpoObservation = (observation, index) => ({
  type: actions.PATIENT_SUBMISSION_UPDATE_HPO_OBSERVATION,
  payload: {
    observation,
    index,
  },
});

export const updateHpoAgeOnSet = (age, index) => ({
  type: actions.PATIENT_SUBMISSION_UPDATE_HPO_AGE_ON_SET,
  payload: {
    age,
    index,
  },
});

export const setHpoResourceDeletionFlag = ({ code, toDelete }) => ({
  type: actions.PATIENT_SUBMISSION_MARK_HPO_FOR_DELETION,
  payload: {
    code,
    toDelete,
  },
});

export const addFamilyHistoryResource = resource => ({
  type: actions.PATIENT_SUBMISSION_ADD_FAMILY_RELATIONSHIP_RESOURCE,
  payload: resource,
});


export const addEmptyFamilyHistory = () => ({
  type: actions.PATIENT_SUBMISSION_ADD_EMPTY_FAMILY_RELATIONSHIP,
  payload: {},
});

export const setFamilyRelationshipResourceDeletionFlag = deleted => ({
  type: actions.PATIENT_SUBMISSION_MARK_FAMILY_RELATIONSHIP_FOR_DELETION,
  payload: {
    deleted,
  },
});

export const assignServiceRequestPractitioner = resource => (
  {
    type: actions.PATIENT_SUBMISSION_ASSIGN_PRACTITIONER,
    payload: resource,
  }
);
