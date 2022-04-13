import React, { Component } from 'react';
import Header from './fragments/Header.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import searchFilterAction from '../reduxActions/SearchFilterAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ROUTES } from '../VirkadeAdminPages.js';
import TabNav from './fragments/TabNav.js';
import validator from 'validator';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import alertAction from '../reduxActions/AlertAction.js';

const defaultLocalState = {
    selActivityFilter: 0,
    activityName: '',
    activityDescription: '',
    activityWebsite: '',
    activitySupportContact: '',
    activityCostPerMin: '',
    activitySetupMin: '',
    activityCreator: '',
    activityEnabled: false,
}

class Activity extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.setActivityDetails = this.setActivityDetails.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let id = urlParams.get('id');
            let event = {
                target: {
                    name: 'selActivityFilter',
                    value: parseInt(id)
                }
            }
            this.updateInput(event)
        }
        this.loading(false)
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    validateInput(data, isAlert = true) {
        let {activityName,
        activityDescription,
        activityWebsite,
        activitySupportContact,
        activityCostPerMin,
        activitySetupMin,
        activityCreator,
        activityEnabled } = data
        let msg = '';
        let valid = true

        if (activityName !== undefined && (activityName === "" || activityName.length < 6)) {
            msg = 'name cannot be empty and must be at least 6 characters'
            valid = false;
        } else if (activityDescription !== undefined && (activityDescription === "" || activityDescription.length < 15)) {
            msg = 'description cannot be empty and must be at least 15 characters'
            valid = false;
        } else if (activityWebsite !== undefined && (activityWebsite === "" || !validator.isURL(activityWebsite))) {
            msg = 'website must be valid url'
            valid = false;
        } else if (activitySupportContact !== undefined && activitySupportContact === "") {
            msg = 'support contact cannot be empty'
            valid = false;
        } else if (activityCostPerMin !== undefined && (activityCostPerMin === "" || !validator.isNumeric(activityCostPerMin.toString()))) {
            msg = 'coster per min needs to be a be a number or decimal'
            valid = false;
        } else if (activitySetupMin !== undefined && ( activitySetupMin === "" || !validator.isNumeric(activitySetupMin.toString()))) {
            msg = 'setup time must be a number'
            valid = false;
        } else if (activityEnabled !== undefined && (activityEnabled === "" || !validator.isBoolean(activityEnabled.toString()))) {
            msg = 'enabled must be a boolean'
            valid = false;
        } else if (activityCreator !== undefined && activityCreator === "0") {
            msg = 'creator cannot be empty'
            valid = false;
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !valid) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: msg })
            this.props.sharedFlagsAction({ alertOpen: true });

        }
        return valid;

    }

    tabData = [
        { active: false, title: ':user search:', pathname: ROUTES.SEARCH_PAGE },
        { active: false, title: ':location:', pathname: ROUTES.LOCATION_PAGE },
        { active: true, title: ':activity:', pathname: ROUTES.ACTIVITY_PAGE },
    ]

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        if (value === '[ ]'){
            value = true;
        } else if (value === '[X]') {
            value = false;
        }
        this.setState({ [key]: value })
        this.validateInput({ [key]: value }, false)
        if (key === 'selActivityFilter') {
            DatabaseAPI.getActivity(this.props.user, value, this.setActivityDetails)
        }
    }

    setActivityDetails(data, error) {
        let newState = Object.assign({}, this.state);
        let activity = data.getActivity
        if (activity) {
            newState.activityName = activity.name
            newState.activityDescription = activity.description
            newState.activityWebsite = activity.webSite
            newState.activitySupportContact = activity.supportContact
            newState.activityCostPerMin = activity.costpm
            newState.activitySetupMin = activity.setupMin
            newState.activityCreator = activity.creator
            newState.activityEnabled = activity.enabled
        } else {
            newState = Object.assign({}, defaultLocalState);
        }
        this.setState(newState);
    }
    addActivity() {
        if (this.validateInput(this.state)) {
            this.loading(true)
            let curState = Object.assign({}, this.state);
            curState.selActivityFilter = 0;
            DatabaseAPI.addUpdateActivity(this.props.user, curState, this.confirmationAlert)
        }
    }

    updateActivity() {
        if (this.validateInput(this.state) && this.state.selActivityFilter && this.state.selActivityFilter > 0) {
            this.loading(true)
            DatabaseAPI.addUpdateActivity(this.props.user, this.state, this.confirmationAlert)
        } else if (!this.state.selActivityFilter || this.state.selActivityFilter === 0) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: 'update requires a selected activity' })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
    }

    confirmationAlert(data, error) {
        if (data && (data.addUpdateActivity)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "activity saved successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAllActivities(this.props.user, this.filterOptionsCallback)
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong. \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.loading(false)
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.loading(false)
        }
    }

    filterOptionsCallback(data, error) {
        if (data && data.getAllActivities && data.getAllActivities.length > 0) {
            this.props.searchFilterAction({ activityFilterOptions: data.getAllActivities })
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <TabNav tabData={this.tabData} />
                <div className='section'>
                    < div className='row'>
                        <div className='col even-space border' style={{ padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::activity details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <select id='activity-filter' style={{ width: '100%' }} name='selActivityFilter' value={this.state.selActivityFilter} onChange={this.updateInput} >
                                    <option key='0' value={0}>activity</option>
                                    {
                                        this.props.searchFilter.activityFilterOptions.map(item => {
                                            return <option key={item.activityId} value={item.activityId}>{item.name}</option>
                                        })
                                    }
                                </select>
                            </div>

                            <div className='separator'></div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityName">name:</label>
                                    <input autoComplete='off' type="text" id="activity-name" name="activityName" value={this.state.activityName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityDescription">description:</label>
                                    <input autoComplete='off' type="text" id="activity-description" name="activityDescription" value={this.state.activityDescription} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityWebsite">website:</label>
                                    <input autoComplete='off' type="text" id="activity-website" name="activityWebsite" value={this.state.activityWebsite} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activitySupportContact">support contact:</label>
                                    <input autoComplete='off' type="text" id="activity-support-contact" name="activitySupportContact" value={this.state.activitySupportContact} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityCostPerMin">cost per min:</label>
                                    <input autoComplete='off' type="text" id="activity-cost-per-min" name="activityCostPerMin" value={this.state.activityCostPerMin} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activitySetupMin">setup time (min):</label>
                                    <input autoComplete='off' type="text" id="activity-setup-min" name="activitySetupMin" value={this.state.activitySetupMin} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityCreator">creator:</label>
                                    <input autoComplete='off' type="text" id="activity-creator" name="activityCreator" value={this.state.activityCreator} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityEnabled">enabled:</label>
                                    <input autoComplete='off' className='checkBox' type="text" id="activity-enabled" name="activityEnabled" value={this.state.activityEnabled ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>


                            <div className='col even-space' style={{ width: '65%' }}>
                                <button style={{ width: '100%', margin: '50px 0', borderWidth: 2 }} onClick={() => this.updateActivity()} >
                                    update activity
                                </button>
                            </div>
                        </div>

                        <div className='col even-space border' style={{ padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::new activity::</h2>
                            <div className='separator'></div>

                            <h3 className='col even-space' style={{ textAlign: 'center' }}>
                                {this.state.validatorMsg}
                            </h3>
                            
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityName">name:</label>
                                    <input autoComplete='off' type="text" id="activity-name" name="activityName" value={this.state.activityName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityDescription">description:</label>
                                    <input autoComplete='off' type="text" id="activity-description" name="activityDescription" value={this.state.activityDescription} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityWebsite">website:</label>
                                    <input autoComplete='off' type="text" id="activity-website" name="activityWebsite" value={this.state.activityWebsite} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activitySupportContact">support contact:</label>
                                    <input autoComplete='off' type="text" id="activity-support-contact" name="activitySupportContact" value={this.state.activitySupportContact} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityCostPerMin">cost per min:</label>
                                    <input autoComplete='off' type="text" id="activity-cost-per-min" name="activityCostPerMin" value={this.state.activityCostPerMin} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activitySetupMin">setup time (min):</label>
                                    <input autoComplete='off' type="text" id="activity-setup-min" name="activitySetupMin" value={this.state.activitySetupMin} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityCreator">creator:</label>
                                    <input autoComplete='off' type="text" id="activity-creator" name="activityCreator" value={this.state.activityCreator} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="activityEnabled">enabled:</label>
                                    <input autoComplete='off' className='checkBox' type="text" id="activity-enabled" name="activityEnabled" value={this.state.activityEnabled ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='col even-space' style={{ width: '65%' }}>
                                <button style={{ width: '100%', margin: '50px 0', borderWidth: 2 }} onClick={() => this.addActivity()} >
                                    add activity
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        searchFilter: state.searchFilter,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
        alertAction: bindActionCreators(alertAction, dispatch),
        searchFilterAction: bindActionCreators(searchFilterAction, dispatch),
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Activity);

