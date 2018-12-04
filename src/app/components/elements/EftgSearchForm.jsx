import React from 'react';
import PropTypes from 'prop-types';
import reactForm from 'app/utils/ReactForm';
import * as eftgSearchActions from 'app/redux/EftgSearchReducer';
import LoadingIndicator from 'app/components/elements/LoadingIndicator';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
import { Set } from 'immutable';
import tt from 'counterpart';


class EftgSearchForm extends React.Component {
    static propTypes = {
        // html component attributes
        formId: PropTypes.string.isRequired, // unique form id for each editor
        successCallback: PropTypes.func, // indicator that the editor is done and can be hidden
        onCancel: PropTypes.func, // hide editor when cancel button clicked

        issuerName: PropTypes.string, // initial value
        title: PropTypes.string, // initial value
    };

    static defaultProps = {
        issuerName: 'issuerName',
        title: 'Title',
    };

    constructor(props) {
        super();
        this.state = { progress: {} };
        this.initForm(props);
    }

    componentWillMount() {
        const { formId } = this.props;

        if (process.env.BROWSER) {
           // Check for draft data
            let draft = localStorage.getItem('eftgSearchData-' + formId);
            if (draft) {
                draft = JSON.parse(draft);
                const { issuerName, title } = this.state;
                if (issuerName) title.props.onChange(draft.issuerName);
                if (title) title.props.onChange(draft.title);
            }
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.refs.titleRef.focus();
        }, 300);
    }

    shouldComponentUpdate = shouldComponentUpdate(this, 'EftgSearchForm');

    componentWillUpdate(nextProps, nextState) {
        if (process.env.BROWSER) {
            const ts = this.state;
            const ns = nextState;
            const tp = this.props;
            const np = nextProps;

            // Save curent draft to localStorage
            if (
                (ns.issuerName && ts.issuerName.value !== ns.issuerName.value) ||
                (ns.title && ts.title.value !== ns.title.value)
            ) {
                // also prevents saving after parent deletes this information
                const { formId } = np;
                const { issuerName, title } = ns;
                const data = {
                    formId,
                    issuerName: issuerName ? issuerName.value : undefined,
                    title: title ? title.value : undefined,
                };

                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    // console.log('save formId', formId, body.value)
                    localStorage.setItem(
                        'eftgSearchData-' + formId,
                        JSON.stringify(data, null, 0)
                    );
                    this.showDraftSaved();
                }, 500);
            }
        }
    }

    componentWillUnmount() {
        const { clearMetaData, formId } = this.props;
        clearMetaData(formId);
    }

    initForm(props) {
        const { isStory, type, fields } = props;
        const maxKb = 65;
        reactForm({
            fields,
            instance: this,
            name: 'eftgSearchForm',
            initialValues: props.initialValues,
            validation: values => ({
                issuerName:
                    (!values.issuerName || values.issuerName.trim() === ''
                        ? tt('g.required')
                        : values.issuerName.length > 255
                          ? tt('eftg_search.shorten_issuer_name')
                          : null),
                title:
                    (!values.title || values.title.trim() === ''
                        ? tt('g.required')
                        : values.title.length > 255
                          ? tt('eftg_search.shorten_title')
                          : null),
            }),
        });
    }

    onIssuerNameChange = e => {
        const value = e.target.value;
        const { issuerName } = this.state;
        issuerName.props.onChange(e);
    };

    onTitleChange = e => {
        const value = e.target.value;
        const { title } = this.state;
        title.props.onChange(e);
    };

    onCancel = e => {
        if (e) e.preventDefault();
        const { formId, onCancel } = this.props;
        const { eftgSearchForm, body } = this.state;
        if (
            !body.value ||
            confirm(tt('reply_editor.are_you_sure_you_want_to_clear_this_form'))
        ) {
            eftgSearchForm.resetForm();
            this.setState({
                rte_value: stateFromHtml(this.props.richTextEditor),
            });
            this.setState({ progress: {} });
            if (onCancel) onCancel(e);
        }
    };

    // As rte_editor is updated, keep the (invisible) 'body' field in sync.
    onChange = rte_value => {
        this.setState({ rte_value });
    };
    
    showDraftSaved() {
        const { draft } = this.refs;
        draft.className = 'EftgSearchForm__draft';
        void draft.offsetWidth; // reset animation
        draft.className = 'EftgSearchForm__draft EftgSearchForm__draft-saved';
    }
    
    render() {
        const { onCancel, onIssuerNameChange, onTitleChange } = this;
        const { issuerName, title } = this.state;
        const {
            reply,
            username,
            formId,
            state,
            successCallback
        } = this.props;
        const { submitting, valid, handleSubmit } = this.state.eftgSearchForm;
        const { postError, issuerNameWarn, titleWarn } = this.state;
        const { progress } = this.state;
        const disabled = submitting || !valid;
        const loading = submitting || this.state.loading;

        const errorCallback = estr => {
            this.setState({ postError: estr, loading: false });
        };
        const successCallbackWrapper = (...args) => {
            this.setState({ loading: false });
            if (successCallback) successCallback(args);
        };
        const replyParams = {
            state,
            successCallback: successCallbackWrapper,
            errorCallback,
        };
        const hasTitleError = title && title.touched && title.error;
        let titleError = null;
        if (
            (hasTitleError &&
                (title.error !== tt('g.required') || body.value !== '')) ||
            titleWarn
        ) {
            titleError = (
                <div className={hasTitleError ? 'error' : 'warning'}>
                    {hasTitleError ? title.error : titleWarn}&nbsp;
                </div>
            );
        }
        const hasIssuerNameError = issuerName && issuerName.touched && issuerName.error;
        let issuerName = null;
        if (
            (hasIssuerNameError &&
                (issuerName.error !== tt('g.required') || body.value !== '')) || issuerNameWarn
        ) {
            issuerNameError = (
                <div className={hasIssuerNameError ? 'error' : 'warning'}>
                    {hasIssuerNameError ? issuerName.error : issuerNameWarn}&nbsp;
                </div>
            );
        }

        // TODO: remove all references to these vframe classes. Removed from css and no longer needed.
        const vframe_class = 'vframe';
        const vframe_section_class = 'vframe__section';
        const vframe_section_shrink_class = 'vframe__section--shrink';

        return (
            <div className="EftgSearchForm row">
                <div className="column small-12">
                    <div
                        ref="draft"
                        className="EftgSearchForm__draft EftgSearchForm__draft-hide"
                    >
                        {tt('reply_editor.draft_saved')}
                    </div>
                    <form
                        className={vframe_class}
                        onSubmit={handleSubmit(({ data }) => {
                            const startLoadingIndicator = () =>
                                this.setState({
                                    loading: true,
                                    postError: undefined,
                                });
                            search({
                                ...data,
                                ...replyParams,
                                startLoadingIndicator,
                            });
                        })}
                        onChange={() => {
                            this.setState({ postError: null });
                        }}
                    >
                        <div className={vframe_section_shrink_class}>
                            <span>
                                <input
                                    type="text"
                                    className="EftgSearchForm__issuerName"
                                    onChange={onIssuerNameChange}
                                    disabled={loading}
                                    placeholder={tt('eftg_search.issuer_name')}
                                    autoComplete="off"
                                    ref="issuerNameRef"
                                    tabIndex={1}
                                    {...issuerName.props}
                                />
                                {issuerNameError}
                            </span>
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <span>
                                <input
                                    type="text"
                                    className="EftgSearchForm__title"
                                    onChange={onTitleChange}
                                    disabled={loading}
                                    placeholder={tt('reply_editor.title')}
                                    autoComplete="off"
                                    ref="titleRef"
                                    tabIndex={1}
                                    {...title.props}
                                />
                                {titleError}
                            </span>
                        </div>
                        <div className={vframe_section_shrink_class}>
                            <div className="error">
                                {body.touched &&
                                    body.error &&
                                    body.error !== 'Required' &&
                                    body.error}
                            </div>
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {postError && (
                                <div className="error">{postError}</div>
                            )}
                        </div>
                        <div className={vframe_section_shrink_class}>
                            {!loading && (
                                <button
                                    type="submit"
                                    className="button"
                                    disabled={disabled}
                                    tabIndex={4}
                                >
                                    {tt('eftg_search.search')}
                                </button>
                            )}
                            {loading && (
                                <span>
                                    <br />
                                    <LoadingIndicator type="circle" />
                                </span>
                            )}
                            &nbsp;{' '}
                            {!loading &&
                                this.props.onCancel && (
                                    <button
                                        type="button"
                                        className="secondary hollow button no-border"
                                        tabIndex={5}
                                        onClick={onCancel}
                                    >
                                        {tt('g.cancel')}
                                    </button>
                                )}
                            {!loading &&
                                !this.props.onCancel && (
                                    <button
                                        className="button hollow no-border"
                                        tabIndex={5}
                                        disabled={submitting}
                                        onClick={onCancel}
                                    >
                                        {tt('g.clear')}
                                    </button>
                                )}
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

let saveTimeout;

import { connect } from 'react-redux';

export default formId =>
    connect(
        // mapStateToProps
        (state, ownProps) => {
            const username = state.user.getIn(['current', 'username']);
            const fields = ['issuerName', 'title'];
            let { issuerName, title } = ownProps;
            
            const ret = {
                ...ownProps,
                fields,
                username,
                initialValues: { issuerName, title },
                state,
                formId
            };
            return ret;
        },

        // mapDispatchToProps
        dispatch => ({
            search: ({
                issuerName,
                title,
                state,
                successCallback,
                errorCallback,
                startLoadingIndicator,
            }) => {
                startLoadingIndicator();

                const operation = {
                    issuerName,
                    title
                };
                dispatch(
                    eftgSearchActions.search({
                        type: EFTG_SEARCH,
                        issuerName,
                        title,
                        errorCallback,
                        successCallback,
                    })
                );
            },
        })
    )(EftgSearchForm);
