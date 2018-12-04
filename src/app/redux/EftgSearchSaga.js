import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '@steemit/steem-js';

import * as eftgSearchActions from './EftgSearchReducer';

export const eftgSearchWatches = [
    takeLatest(eftgSearchActions.EFTG_SEARCH, eftgSearchCall)
];

function* eftgSearchCall(searchData) {
  const items = yield call([api, api.eftgSearch], searchData);
  yield put(eftgSearchActions.receiveSearch({ items }));
}
