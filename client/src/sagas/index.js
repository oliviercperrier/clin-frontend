import {
  all, call, spawn, delay,
} from 'redux-saga/effects';

import watchedAppSagas from './app';
import watchedUserSagas from './user';
import watchedPatientSagas from './patient';
import watchedVariantSagas from './variant';
import watchedVariantDetailsSagas from './variantDetails';
import watchedRouterSagas from './router';
import watchSavePatientSubmission from './patientSubmission';
import watchPatientEdition from './patientEdition';
import watchPatientCreation from './patientCreation';
import watchNanuqReportSagas from './nanuq';
import watchPrescriptions from './prescriptions';
import watchedServiceRequestSagas from './serviceRequest.js'

const makeRestartable = (saga) => function* restableSaga() {
  yield spawn(function* spawnedRestableSaga() {
    while (true) {
      try {
        yield call(saga);
        console.error('Unexpected rootSaga termination.', saga); // eslint-disable-line no-console
      } catch (e) {
        console.error('Saga error, the saga will be restarted', e); // eslint-disable-line no-console
      }
      yield delay(1000);
    }
  });
};

const rootSagas = [
  watchedAppSagas,
  watchedUserSagas,
  watchedPatientSagas,
  watchedVariantSagas,
  watchedVariantDetailsSagas,
  watchedRouterSagas,
  watchSavePatientSubmission,
  watchPatientCreation,
  watchNanuqReportSagas,
  watchPrescriptions,
  watchPatientEdition,
  watchedServiceRequestSagas
].map(makeRestartable);

export default function* rootSaga() {
  yield all(rootSagas.map((saga) => call(saga)));
}
