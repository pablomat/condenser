import React from 'react';
import { browserHistory } from 'react-router';
import EftgSearchForm from 'app/components/elements/EftgSearchForm';
import { EFTG_SEARCH_FORM_ID } from 'shared/constants';

const formId = EFTG_SEARCH_FORM_ID;
const EftgSearchFormObject = EftgSearchForm(formId);

class EftgSearch extends React.Component {
    constructor() {
        super();
        this.success = () => {
            localStorage.removeItem('eftgSearchData-' + formId);
            browserHistory.push('/searched.html');
        };
    }
    render() {
        const { success } = this;
        return (
            <div className="SubmitPost">
                <EftgSearchFormObject
                    successCallback={success}
                />
            </div>
        );
    }
}

module.exports = {
    path: 'search.html',
    component: EftgSearch
};
