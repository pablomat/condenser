// Action constants
export const EFTG_SEARCH = 'eftgSearch/SEARCH';

const defaultState = fromJS({
  issuerName: '',
  title: ''
});

export default function reducer(state = defaultState, action) {
    const payload = action.payload;

    switch (action.type) {
        case SEARCH: {
            const issuerName = payload.issuerName;
            const title = payload.title;
            return state.merge({
                issuerName,
                title,
            });
        }

        default:
            return state;
    }
}

// Action creators
export const search = payload => ({
    type: EFTG_SEARCH,
    payload,
});
