import React, { Component } from 'react';
import Header from './fragments/Header.js'
import ConfirmationModal from './fragments/ConfirmationModal.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import searchFilterAction from '../reduxActions/SearchFilterAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SessionTableDisplay from "./fragments/SessionTableDisplay.js"
import { ROUTES } from '../VirkadeAdminPages.js';
import validator from 'validator';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import { pickerData } from '../../static/pickerData';
import alertAction from '../reduxActions/AlertAction.js';
import moment from "moment";
import * as DataConstants from "../dataAccess/DataConstants"

const defaultLocalState = {
    sessions: [],
    rawSessions: {},
    availableSessionsPicker: [],
    availableSessionsRaw: [],
    lengthOptions: [],
    userId: 0,
    sessionId: 0,
    selectedSessionIds: [],
    rawStartDate: '',
    rawEndDate: '',
    startDate: '',
    endDate: '',
    locationName: '',
    activityName: '',
    payed: false,
    firstName: '',
    lastName: '',
    username: '',
    displayName: '',
    emailAddress: '',
    costpm: 0,
    taxRate: 0,
    sessionTotal: 0,
    transactionId: 0,
    refId: '',
    approvalCode: '',
    payment: 0,
    paymentDescription: "",
    selAvilSessionTime: 0,
}

const ACTION = {
    UPDATE: 'update',
    DELETE: 'delete',
    UNPAY: 'unpay'
}

class User extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.setInit = this.setInit.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.setSessionOptions = this.setSessionOptions.bind(this);
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        this.loading(true)
        let locationDetails = {}
        let activityDetails = {}
        Object.entries(this.props.searchFilter.locationFilterOptions).forEach(([key, value]) => {
            locationDetails[value.locationId] = value
        })
        Object.entries(this.props.searchFilter.activityFilterOptions).forEach(([key, value]) => {
            activityDetails[value.activityId] = value
        })
        this.setState({ locationDetails: locationDetails, activityDetails: activityDetails })
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let userId = urlParams.get('userId');
            let sessionId = urlParams.get('id') || 0;
            this.setState({ userId: userId, sessionId: parseInt(sessionId) })
            if (userId) {
                DatabaseAPI.getAllFieldsUserById(this.props.user, userId, this.setInit)
            } else {
                DatabaseAPI.getSessionById(this.props.user, parseInt(sessionId), this.setInit)
            }
        }
        DatabaseAPI.getAllSessions(this.props.user, this.props.searchFilter, this.setInit)
        DatabaseAPI.getAvailableSessions(this.props.user, undefined, this.setSessionOptions)
    }

    componentDidUpdate(prevProps, prevState) {
        let curSessionId = this.state.sessionId
        let urlParams = new URLSearchParams(this.props.location.search);
        let sessionId = urlParams.get('id') || 0;
        if (parseInt(sessionId) !== curSessionId) {
            this.loading(true)
            this.setState({ sessionId: parseInt(sessionId) })
            DatabaseAPI.getSessionById(this.props.user, sessionId, this.setInit)
            DatabaseAPI.getAvailableSessions(this.props.user, undefined, this.setSessionOptions)
        }
        if (prevProps.searchFilter.locationFilterOptions !== this.props.searchFilter.locationFilterOptions) {
            let locationDetails = {}
            Object.entries(this.props.searchFilter.locationFilterOptions).forEach(([key, value]) => {
                locationDetails[value.locationId] = value;
            })
            this.setState({ locationDetails: locationDetails })
        }
        if (prevProps.searchFilter.activityFilterOptions !== this.props.searchFilter.activityFilterOptions) {
            let activityDetails = {}
            Object.entries(this.props.searchFilter.activityFilterOptions).forEach(([key, value]) => {
                activityDetails[value.activityId] = value
            })
            this.setState({ activityDetails: activityDetails })
        }
    }

    setInit(data, error) {
        if (data && data.getUserById) {
            let newState = Object.assign({}, this.state);
            let user = data.getUserById
            newState.username = user.username
            newState.firstName = user.firstName
            newState.lastName = user.lastName
            newState.userId = user.userId
            this.setState(newState);
            this.loading(false)
        } else if (data && data.getSessionById) {
            let newState = Object.assign({}, this.state);
            let session = data.getSessionById
            let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
            let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
            newState.rawStartDate = session.startDate
            newState.rawEndDate = session.endDate
            let duration = ((endDate.clone()).subtract(startDate.clone()) / 1000) / 60

            let setupTime = session.activity.setupMin
            let costpm = session.activity.costpm
            let taxRate = session.location.taxRate
            let sessionTotal = ((duration - setupTime) * costpm * (1 + taxRate))
            newState.startDate = startDate.format('LLL')
            newState.endDate = endDate.format('LLL')
            newState.locationName = session.location.name
            this.props.searchFilter.selLocationFilter = session.location.locationId
            newState.activityName = session.activity.name
            this.props.searchFilter.selActivityFilter = session.activity.activityId
            newState.payed = session.payed
            newState.userId = session.userId
            newState.username = session.username
            newState.displayName = session.displayName || ''
            newState.firstName = session.firstName
            newState.lastName = session.lastName
            newState.taxRate = taxRate
            newState.costpm = costpm
            newState.setupMin = setupTime
            newState.sessionTotal = sessionTotal
            newState.duration = duration
            newState.transactionId = session.transaction ? session.transaction.transactionId : 0
            newState.serviceName = session.transaction ? session.transaction.serviceName : ''
            newState.selectedSessionIds = session.transaction ? session.transaction.sessionIds : []
            for (let i in pickerData.serviceName) {
                if (pickerData.serviceName[i].label === newState.serviceName) {
                    newState.serviceName = pickerData.serviceName[i].value
                    break;
                }
            }
            newState.refId = session.transaction ? session.transaction.refId : ''
            newState.approvalCode = session.transaction ? session.transaction.approvalCode : ''
            newState.payment = session.transaction ? session.transaction.payment : 0
            newState.paymentDescription = session.transaction ? session.transaction.description.replaceAll(DataConstants.NEW_LINE_TOKEN, " ") : ''

            this.setState(newState);
        } else if (data && data.getAllSessions) {
            let sessions = data.getAllSessions
            let rawSessions = {}
            for (let index in sessions) {
                let session = sessions[index];
                rawSessions[session.sessionId] = session
            }
            this.setState({ rawSessions: rawSessions });
            this.setState({ sessions: sessions });
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    setSessionOptions(data) {
        let pickerItems = [];
        let lengthOptions = new Set();
        if (data && data.getAvailableSessions) {
            (data.getAvailableSessions).map((item, index) => {
                lengthOptions.add(item.length)
                let startDate = moment(item.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(item.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('ddd hh:mm a')
                endDate = endDate.format('ddd hh:mm a')
                pickerItems.push({ length: item.length, key: index, label: `${startDate} - ${endDate}`, value: index })
                return true
            })
            if ((data.getAvailableSessions).length > 0) {
                this.setState({ 'availableSessionsRaw': data.getAvailableSessions })
                this.setState({ 'availableSessionsPicker': pickerItems })
                this.setState({ lengthOptions: Array.from(lengthOptions) })
            }
        }
        this.loading(false)
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    validateInput(data, isAlert = true) {
        let { serviceName,
            refId,
            approvalCode,
            payment,
            sessionId,
            userId,
            selAvilSessionTime,
            availableSessionsPicker,
            selectedSessionIds,
            selLocationFilter,
            selActivityFilter,
        } = data

        sessionId = sessionId ? sessionId : this.state.sessionId
        userId = userId ? userId : this.state.userId
        let msg = '';
        let isValid = true
        if (availableSessionsPicker !== undefined && availableSessionsPicker.length <= 0) {
            msg = 'no sessions available'
            isValid = false;
        } else if (selAvilSessionTime !== undefined && selAvilSessionTime < 0) {
            msg = 'must select at least one play session'
            isValid = false;
        } else if (selLocationFilter !== undefined && selLocationFilter === "") {
            msg = 'valid location must be selected'
            isValid = false;
        } else if (selActivityFilter !== undefined && selActivityFilter === "") {
            msg = 'valid activity must be selected'
            isValid = false;
        } else if (userId === undefined || userId === '' || !validator.isNumeric(String(userId) || parseInt(userId) <= 0)) {
            msg = 'valid user must be selected'
            isValid = false;
        } else if (sessionId === undefined || sessionId === '' || sessionId <= 0) {
            msg = 'must be valid session selection'
            isValid = false;
        } else if (selectedSessionIds !== undefined && (!selectedSessionIds.includes(sessionId))) {
            msg = 'the transaction does not appear to contain the selected session'
            isValid = false;
        } else if (serviceName !== undefined && serviceName <= 0) {
            msg = 'payment type must be selected'
            isValid = false;
        } else if (refId !== undefined && (refId === '' || !validator.isNumeric(String(refId)))) {
            msg = 'ref id must not be empty and is expected to be numeric'
            isValid = false;
        } else if (approvalCode !== undefined && (approvalCode === '' || approvalCode < 4)) {
            msg = 'approval code must not be empty and is expected to be more than 3 characters'
            isValid = false;
        } else if (payment !== undefined && (payment === '' || !validator.isCurrency(String(payment)))) {
            msg = 'payment amount has to be a valid currency'
            isValid = false;
        }
        this.setState({ validatorMsg: msg })
        if (isAlert && !isValid) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: msg })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        return isValid;

    }

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        this.validateInput({ [key]: value }, false)
        if (key === 'selActivityFilter' || key === 'selLocationFilter') {
            this.props.searchFilterAction({ [key]: value })
            let filter = Object.assign({}, this.props.searchFilter)
            filter[key] = value
            DatabaseAPI.getAllSessions(this.props.user, filter, this.setInit)
            DatabaseAPI.getAvailableSessions(this.props.user, filter, this.setSessionOptions)
        } else {
            this.setState({ [key]: value })
        }
        if (key === 'selUserId') {

        }
    }

    sessionAction(action) {
        let newState = Object.assign({}, this.state)
        let selectedTimeIndex = newState.selAvilSessionTime;
        switch (action) {
            case ACTION.DELETE:
                newState.serviceName = undefined
                newState.refId = undefined
                newState.approvalCode = undefined
                newState.payment = undefined
                newState.selAvilSessionTime = undefined
                newState.availableSessionsPicker = undefined
                newState.selectedSessionIds = undefined
                if (this.validateInput(newState, true)) {
                    this.loading(true)
                    DatabaseAPI.deleteUserSession(this.props.user, newState.sessionId, this.confirmationAlert)
                }
                break;
            case ACTION.UPDATE:
                if (selectedTimeIndex === undefined || !validator.isNumeric(String(selectedTimeIndex)) || parseInt(selectedTimeIndex) < 0) {
                    let error = []
                    error[0] = "no valid play session detected"
                    this.confirmationAlert(error);
                    break;
                }

                let selLocation = this.props.searchFilter.selLocationFilter
                let selActivity = this.props.searchFilter.selActivityFilter
                newState.serviceName = undefined
                newState.refId = undefined
                newState.approvalCode = undefined
                newState.payment = undefined
                newState.selectedSessionIds = undefined
                let updateSelectedSession = newState.availableSessionsRaw[selectedTimeIndex]
                newState.startDate = updateSelectedSession ? updateSelectedSession.startDate : newState.startDate
                newState.endDate = updateSelectedSession ? updateSelectedSession.endDate : newState.endDate
                newState.length = updateSelectedSession.length
                newState.locationName = selLocation && selLocation !== "" ? this.state.locationDetails[selLocation].name : ""
                newState.activityName = selActivity && selActivity !== "" ? this.state.activityDetails[selActivity].name : ""
                if (this.validateInput(newState, true)) {
                    this.loading(true)
                    DatabaseAPI.updateUserSession(this.props.user, newState, this.confirmationAlert)
                }
                break;
            case ACTION.UNPAY:
                newState.serviceName = undefined
                newState.refId = undefined
                newState.approvalCode = undefined
                newState.payment = undefined
                newState.length = newState.duration
                newState.startDate = newState.rawStartDate
                newState.endDate = newState.rawEndDate
                newState.availableSessionsPicker = undefined
                if (this.validateInput(newState, true)) {
                    this.loading(true)
                    newState.payed = false
                    newState.transactionId = 0
                    DatabaseAPI.updateUserSession(this.props.user, newState, this.confirmationAlert)
                }
                break;
            default:
                break;
        }
    }

    updateTrans() {
        let newState = Object.assign({}, this.state)
        newState.selAvilSessionTime = undefined
        newState.availableSessionsPicker = undefined

        if (this.validateInput(newState, true)) {
            this.loading(true)
            for (let i in pickerData.serviceName) {
                if (pickerData.serviceName[i].value === parseInt(newState.serviceName)) {
                    newState.serviceName = pickerData.serviceName[i].label
                    break;
                }
            }
            DatabaseAPI.addUpdateTransaction(this.props.user, newState, this.confirmationAlert)
        }
    }

    confirmationAlert(data, error) {
        if (data && (data.updateUserSession)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: `session id: ${data.updateUserSession.sessionId} updated successfully` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.props.history.push({ pathname: ROUTES.BASE_PAGE })
            this.props.history.goBack();
        } else if (data && (data.deleteUserSession)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: `user session id: ${data.deleteUserSession.sessionId} deleted successfully` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.props.history.push({ pathname: ROUTES.BASE_PAGE })
            this.props.history.goBack();
        } else if (data && (data.addUpdateTransaction)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: `transaction id: ${data.addUpdateTransaction.transactionId} updated successfully` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.props.history.push({ pathname: ROUTES.BASE_PAGE })
            this.props.history.goBack();
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong. \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        this.loading(false)
    }

    filterOptionsCallback(data, error) {
        if (data && data.getAllActivities && data.getAllActivities.length > 0) {
            this.props.searchFilterAction({ activityFilterOptions: data.getAllActivities })
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
        }
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} curModule={this} />
                <ConfirmationModal isOpen={this.state.modalIsOpen} title={this.state.modalTitle} body={this.state.modalBody} onClose={this.state.modalOnClose} parentState={this.state} onSubmit={this.state.modalOnSubmit} />
                <div className='section'>
                    <div className='row even-space'>
                        <h4>{this.state.validatorMsg}</h4>
                    </div>
                    < div className='row' >
                        <div className='col border' style={{minHeight: 800, flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::session details::</h2>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label>session id: {this.state.sessionId}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >start time: {this.state.startDate}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >end time: {this.state.endDate}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >location: {this.state.locationName}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label  >activity: {this.state.activityName}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >payed: {this.state.payed.toString()}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >username: {this.state.username}</label>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >first name: {this.state.firstName}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label>last name: {this.state.lastName}</label>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >display name: {this.state.displayName}</label>
                                </div>
                            </div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction(ACTION.DELETE)} >
                                    delete session
                                </button>
                            </div>
                        </div>

                        <div className='col border' style={{ minHeight: 800, flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::update session::</h2>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label htmlFor="id" >session id:</label>
                                    <input autoComplete='off' type="text" id="session-id" name="id" onChange={this.updateInput} value={this.state.sessionId} readOnly />
                                </div>
                            </div>
                            <div className='row even-space' >
                                <div className='row'>
                                    <label>{this.state.lengthOptions.length > 0 ? ':: pick a time below ::' : ':: no time available ::'}</label>
                                </div>
                            </div>

                            {
                                this.state.lengthOptions.map((length, index) => {
                                    return (
                                        <div className='col border' style={{ width: '90%' }}>
                                             <div className='row even-space'>&nbsp;</div>
                                            <div className='row even-space'>
                                                <label htmlFor={`sel-avil-session-time-${length}`} >session length: {length} minute</label>
                                            </div>
                                            <div className='row even-space' style={{ 'width': '100%' }}>
                                                <select
                                                    style={{flexGrow: 1, borderLeft: 'none', borderRight: 'none' }}
                                                    id={`sel-avil-session-time-${length}`}
                                                    value={this.state.selAvilSessionTime}
                                                    name='selAvilSessionTime'
                                                    onChange={this.updateInput}>
                                                    <option key={index - 10 } value={index - 10 } >select</option>
                                                    {
                                                        this.state.availableSessionsPicker.map(item => {
                                                            if (item.length === length) {
                                                                return <option key={item.key} value={item.value} >{item.label}</option>
                                                            } else {
                                                                return false;
                                                            }
                                                        })
                                                    }
                                                </select>
                                            </div>
                                        </div>

                                    )
                                })
                            }

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="selLocationFilter" >location:</label>
                                <select style={{ flexGrow: 1 }} id='location-filter' name='selLocationFilter' value={this.props.searchFilter.selLocationFilter} onChange={this.updateInput} >
                                    <option key='0' value=''>location</option>
                                    {
                                        this.props.searchFilter.locationFilterOptions.map(item => {
                                            return <option key={item.locationId} value={item.locationId}>{item.name}</option>
                                        })
                                    }
                                </select>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="selActivityFilter" >activity:</label>
                                <select style={{ flexGrow: 1 }} id='activity-filter' name='selActivityFilter' value={this.props.searchFilter.selActivityFilter} onChange={this.updateInput} >
                                    <option key='0' value=''>activity</option>
                                    {
                                        this.props.searchFilter.activityFilterOptions.map(item => {
                                            return <option key={item.activityId} value={item.activityId}>{item.name}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="username" >username:</label>
                                    <input autoComplete='off' type="text" id="username" name="username" onChange={this.updateInput} value={this.state.username} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="displayName" >display name:</label>
                                    <input autoComplete='off' type="text" id="display-name" name="displayName" onChange={this.updateInput} value={this.state.displayName} />
                                </div>
                            </div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction(ACTION.UPDATE)} >
                                    update session
                                </button>
                            </div>
                        </div>

                        <div className='col border' style={{ minHeight: 800, flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::transaction details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ 'width': '90%' }} >
                                <div className='col even-space' >
                                    <div>duration</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }} >
                                    <div> - </div>
                                </div>
                                <div className='col even-space' >
                                    <div>setup</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div> X </div>
                                </div>
                                <div className='col even-space' >
                                    <div>cost/min</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div> X </div>
                                </div>
                                <div className='col even-space' >
                                    <div>tax rate</div>
                                </div>
                            </div>
                            <div className='row even-space' style={{ 'width': '90%' }}>
                                <div className='col even-space' >
                                    <div>{this.state.duration} [min]</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div>-</div>
                                </div>
                                <div className='col even-space' >
                                    <div>{this.state.setupMin} [min]</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div>X</div>
                                </div>
                                <div className='col even-space' >
                                    <div>${this.state.costpm.toFixed(2)}</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div>X</div>
                                </div>
                                <div className='col even-space' >
                                    <div>{this.state.taxRate.toFixed(3)}%</div>
                                </div>
                            </div>
                            <div className='separator'></div>
                            <div className='row even-space' >
                                <div>session total: ${this.state.sessionTotal.toFixed(2)}</div>
                            </div>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="transactionId" >trans id: #</label>
                                <input autoComplete='off' type="text" id="transaction-id" name="transactionId" onChange={this.updateInput} value={this.state.transactionId} readOnly />
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="sessionIds" >session ids on trans:</label>
                                <input autoComplete='off' type="text" id="session-ids" name="sessionIds" onChange={this.updateInput} value={this.state.selectedSessionIds} readOnly />
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="serviceName" >payment type:</label>
                                <select
                                    name="serviceName"
                                    id="service-name"
                                    style={{ 'flexGrow': 1 }}
                                    value={this.state.serviceName}
                                    onChange={this.updateInput}>
                                    {
                                        (pickerData.serviceName).map((item, index) => {
                                            return <option key={index} id={index} value={item.value} >{item.label}</option>
                                        })
                                    }
                                </select>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="refId" >ref id: #</label>
                                <input autoComplete='off' type="text" id="ref-id" name="refId" onChange={this.updateInput} value={this.state.refId} />
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="approvalCode" >approval code: </label>
                                <input autoComplete='off' type="text" id="approval-code" name="approvalCode" onChange={this.updateInput} value={this.state.approvalCode} />
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="payment" >payment: $</label>
                                <input autoComplete='off' type="text" id="payment" name="payment" onChange={this.updateInput} value={this.state.payment} />
                            </div>

                            <div className='row even-space' style={{ width: '80%' }} >
                                <label htmlFor="paymentDescription">:description &amp; comments:</label>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }} >
                                <textarea style={{ width: '100%', height: 75 }} type='text' autoComplete='off' id="payment-description" name="paymentDescription" onChange={this.updateInput} value={this.state.paymentDescription} required></textarea>
                            </div>

                            <div className='row' style={{ width: '100%' }}>
                                {this.state.payed &&
                                    <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction(ACTION.UNPAY)} >
                                        mark unpayed
                                    </button>
                                }
                                <button style={{ 'flexGrow': 1 }} onClick={() => this.updateTrans()} >
                                    update transaction
                                </button>
                            </div>
                        </div>
                    </ div>
                </ div>
                <div className='section'>
                    <div className='row' style={{ flexGrow: 2, alignSelf: 'flex-start' }}>
                        <SessionTableDisplay parentState={this.state} parentProps={this.props} right={true} />
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


export default connect(mapStateToProps, mapDispatchToProps)(User);

