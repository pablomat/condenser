import React from 'react';
import { browserHistory } from 'react-router';
import ReplyEditor from 'app/components/elements/ReplyEditor';
import { SUBMIT_FORM_ID } from 'shared/constants';

const formId = SUBMIT_FORM_ID;
const SubmitReplyEditor = ReplyEditor(formId);

class EftgSearch extends React.Component {
    constructor() {
        super();
        this.success = () => {
            localStorage.removeItem('eftgSearchData-' + formId);
            browserHistory.push('/searched');
        };
    }
    render() {
        const { success } = this;
        return (
            <div className="SubmitPost">
                <SubmitReplyEditor
                    type="submit_story"
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
