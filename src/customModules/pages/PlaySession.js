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
    selUserId: 0,
    id: 0,
    startDate: '',
    endDate: '',
    locationName: '',
    activityName: '',
    payed: false,
    firstName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    costpm: 0,
    taxRate: 0,
    sessionTotal: 0,
    transactionId: 0,
    refId: '',
    payment: 0,
    paymentDescription: "",
    selAvilSessionTime: 0,
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
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let userId = urlParams.get('userId');
            let sessionId = urlParams.get('id') || 0;
            this.setState({ selUserId: userId, id: parseInt(sessionId) })
            if (userId) {
                DatabaseAPI.getAllFieldsUserById(this.props.user, userId, this.setInit)
            }
        }
        DatabaseAPI.getAllSessions(this.props.user, this.props.searchFilter, this.setInit)
        DatabaseAPI.getAvailableSessions(this.props.user, undefined, this.setSessionOptions)
    }

    componentDidUpdate() {
        let curSessionId = this.state.id
        let urlParams = new URLSearchParams(this.props.location.search);
        let sessionId = urlParams.get('id') || 0;
        if (parseInt(sessionId) !== curSessionId) {
            this.loading(true)
            this.setState({ id: parseInt(sessionId) })
            DatabaseAPI.getSessionById(this.props.user, sessionId, this.setInit)
            DatabaseAPI.getAvailableSessions(this.props.user, undefined, this.setSessionOptions)
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
            newState.username = session.username
            newState.firstName = session.firstName
            newState.lastName = session.lastName
            newState.taxRate = taxRate
            newState.costpm = costpm
            newState.setupMin = setupTime
            newState.sessionTotal = sessionTotal
            newState.duration = duration
            newState.transactionId = session.transaction ? session.transaction.transactionId : 0
            newState.serviceName = session.transaction ? session.transaction.serviceName : ''
            for (let i in pickerData.serviceName) {
                if (pickerData.serviceName[i].label === newState.serviceName) {
                    newState.serviceName = pickerData.serviceName[i].value
                    break;
                }
            }
            newState.refId = session.transaction ? session.transaction.refId : ''
            newState.payment = session.transaction ? session.transaction.payment : 0
            newState.paymentDescription = session.transaction ? session.transaction.description.replaceAll(DataConstants.NEW_LINE_TOKEN, " ") : ''

            this.setState(newState);
        } else if (data && data.getAllSessions) {
            let newState = Object.assign({}, this.state);
            let sessions = data.getAllSessions
            newState.sessions = sessions
            for (let index in sessions) {
                let session = sessions[index];
                if (newState.id === session.sessionId) {
                    let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                    let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
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
                    newState.username = session.username
                    newState.firstName = session.firstName
                    newState.lastName = session.lastName

                    newState.taxRate = taxRate
                    newState.costpm = costpm
                    newState.setupMin = setupTime
                    newState.sessionTotal = sessionTotal

                    newState.duration = duration
                    newState.transactionId = session.transaction ? session.transaction.transactionId : 0
                    newState.serviceName = session.transaction ? session.transaction.serviceName : ''
                    for (let i in pickerData.serviceName) {
                        if (pickerData.serviceName[i].label === newState.serviceName) {
                            newState.serviceName = pickerData.serviceName[i].value
                            break;
                        }
                    }
                    newState.refId = session.transaction ? session.transaction.refId : ''
                    newState.payment = session.transaction ? session.transaction.payment : 0
                    newState.paymentDescription = session.transaction ? session.transaction.description.replaceAll(DataConstants.NEW_LINE_TOKEN, " ") : ''

                }
                newState.rawSessions[session.sessionId] = session
            }
            this.setState(newState);
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    setSessionOptions(data) {
        let pickerItems = [];
        if (data.getAvailableSessions) {
            (data.getAvailableSessions).map((item, index) => {
                let startDate = moment(item.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(item.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('ddd hh:mm a')
                endDate = endDate.format('ddd hh:mm a')
                pickerItems.push({ key: index, label: `${startDate} - ${endDate}`, value: index })
                return true
            })
            if ((data.getAvailableSessions).length > 0) {
                this.setState({ 'availableSessionsRaw': data.getAvailableSessions })
                this.setState({ 'availableSessionsPicker': pickerItems })
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
        let { username,
            serviceName,
            refId,
            payment,
            id } = data
        let msg = '';
        let isValid = true

        if (id !== undefined && id <= 0) {
            msg = 'must be valid session selection'
            isValid = false;
        } else if (serviceName !== undefined && serviceName <= 0) {
            msg = 'payment type must be selected'
            isValid = false;
        } else if (refId !== undefined && (refId === '' || !validator.isNumeric(String(refId)))) {
            msg = 'ref id must not be empty and is expected to be numeric'
            isValid = false;
        } else if (payment !== undefined && (payment === '' || !validator.isCurrency(String(payment)))) {
            msg = 'payment amount has to be a valid currency'
            isValid = false;
        } else if (payment !== undefined && payment !== this.state.sessionTotal.toFixed(2)) {
            msg = 'payment amount must match the session total [for now].  If you needed to do some multiple transaction payment then please note the details in the description'
            isValid = false;
        } else if (username !== undefined && (username === "" || username.length < 6)) {
            msg = 'username must be at least 6 characters'
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
        } else {
            this.setState({ [key]: value })
        }
        if (key === 'selUserId') {

        }
    }

    sessionAction(action) {
        alert('session action clicked')
    }

    updateTrans() {
        if (this.validateInput(this.state, true)) {
            this.loading(true)
            let newState = Object.assign({}, this.state)
            for (let i in pickerData.serviceName) {
                if (pickerData.serviceName[i].value === parseInt(newState.serviceName)) {
                    newState.serviceName = pickerData.serviceName[i].label
                    break;
                }
            }
            alert('updateTrans clicked')
            //DatabaseAPI.addUpdateTransaction(this.props.user, newState, this.confirmationAlert)
        }
    }

    confirmationAlert(data, error) {
        if (data && (data.addUpdateTransaction)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "transaction updated successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.props.parentProps.history.push({ pathname: ROUTES.BASE_PAGE })
            this.props.parentProps.history.goBack();
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong. \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
            this.props.sharedFlagsAction({ alertOpen: true });
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
                    < div className='row'>
                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::session details::</h2>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label>session id: {this.state.id}</label>
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
                                    <label >user name: {this.state.username}</label>
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

                            <div style={{ minHeight: 122 }}></div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction('delete')} >
                                    delete session
                                    </button>
                            </div>
                        </div>

                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::update session::</h2>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label htmlFor="id" >session id:</label>
                                    <input autoComplete='off' type="text" id="session-id" name="id" onChange={this.updateInput} value={this.state.id} readOnly />
                                </div>
                            </div>
                            <div className='row even-space' >
                                <div className='row'>
                                    <label>:: pick a time below ::</label>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <select
                                    style={{ flexGrow: 1 }}
                                    id='sel-avil-session-time'
                                    value={this.state.selAvilSessionTime}
                                    name='selAvilSessionTime'
                                    onChange={this.updateInput}>
                                    {
                                        this.state.availableSessionsPicker.map(item => {
                                            return <option key={item.key} value={item.value} >{item.label}</option>
                                        })
                                    }
                                </select>
                            </div>

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
                                    <label htmlFor="username" >user name:</label>
                                    <input autoComplete='off' type="text" id="username" name="username" onChange={this.updateInput} value={this.state.username} />
                                </div>
                            </div>

                            <div style={{ minHeight: 92 }}></div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction('update')} >
                                    update session
                                    </button>
                            </div>
                        </div>

                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
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
                                    <button style={{ 'flexGrow': 1 }} onClick={() => this.sessionAction('unpay')} >
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

