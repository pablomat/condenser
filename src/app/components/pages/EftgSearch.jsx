import React from 'react';
import tt from 'counterpart';
import { APP_NAME } from 'app/client_config';

class EftgSearch extends React.Component {
    render() {
        return (
            <div className="row">
                <div>
                    <h2>{tt('g.eftg_search_title')}</h2>
                    <p>Hello.</p>
                </div>
            </div>
        );
    }
}

module.exports = {
    path: 'search.html',
    component: EftgSearch,
};
