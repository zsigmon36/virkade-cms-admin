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
    firstName: '',
    lastName: '',
    username: '',
    emailAddress: '',
    costpm: 0,
    taxRate: 0,
    sessionTotal: 0,

    modalIsOpen: false,
    modalTitle: undefined,
    modalBody: undefined,
    modalOnClose: () => { return true },
    modalOnSubmit: () => { return true }
}

class User extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.setInit = this.setInit.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.setSessionOptions = this.setSessionOptions.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        this.loading(true)
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let userId = urlParams.get('userId');
            let sessionId = urlParams.get('id');
            this.setState({ selUserId: userId, id: sessionId })
            if (userId) {
                DatabaseAPI.getAllFieldsUserById(this.props.user, userId, this.setInit)
            }
        }
        DatabaseAPI.getAllSessions(this.props.user, this.props.searchFilter, this.setInit)
        DatabaseAPI.getAvailableSessions(this.props.user, undefined, this.setSessionOptions)
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
        } else if (data && data.getAllSessions) {
            let newState = Object.assign({}, this.state);
            let sessions = data.getAllSessions
            for (let index in sessions) {
                let session = sessions[index];
                if (newState.id === session.sessionId) {
                    newState.startDate = session.startDate
                    newState.endDate = session.endDate
                    newState.locationName = session.location.name
                    newState.activityName = session.activity.name
                    newState.payed = session.payed

                }
                newState.rawSessions[session.sessionId] = session
            }
            this.setState(newState);
            this.loading(false)
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
            this.loading(false)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
            this.loading(false)
        }
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
        let { postalCode,
            age,
            weight,
            number,
            firstName,
            lastName,
            emailAddress,
            username,
            password,
            securityQuestion } = data
        let msg = '';
        let isValid = true

        if (postalCode !== undefined && postalCode !== '' && !validator.isPostalCode(postalCode, "US")) {
            msg = 'postal code is not valid'
            isValid = false;
        } else if (age !== undefined && age !== '' && (!validator.isNumeric(String(age)) || age.length > 3)) {
            msg = 'age has to be a number and less than 999'
            isValid = false;
        } else if (weight !== undefined && weight !== '' && (!validator.isNumeric(String(weight)) || weight.length > 3)) {
            msg = 'weight has to be a number and less than 999'
            isValid = false;
        } else if (number !== undefined && number !== '' && !validator.isMobilePhone(number, 'any')) {
            msg = 'mobile phone number is invalid'
            isValid = false;
        } else if (firstName !== undefined && firstName === "") {
            msg = 'first name cannot be empty'
            isValid = false;
        } else if (lastName !== undefined && lastName === "") {
            msg = 'last name cannot be empty'
            isValid = false;
        } else if (emailAddress !== undefined && !validator.isEmail(emailAddress)) {
            msg = 'email address is not a valid'
            isValid = false;
        } else if (username !== undefined && (username === "" || username.length < 6)) {
            msg = 'username must be at least 6 characters'
            isValid = false;
        } else if (password !== undefined && (password !== "" && password.length < 8)) {
            msg = 'password must be at least 8 characters or left empty to remain unchanged'
            isValid = false;
        } else if (securityQuestion !== undefined && securityQuestion === "") {
            msg = 'security question cannot be empty'
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
        this.setState({ [key]: value })
        this.validateInput({ [key]: value }, false)
        if (key === 'selUserId') {

        }
    }

    closeModal() {
        this.setState({ modalIsOpen: false })
    }

    confirmationAlert(data, error) {
        if (data && (data.updateUser)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "user updated successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAllFieldsUserById(this.props.user, data.updateUser.userId, this.setUserDetails)
        } else if (data && (data.updateUserType)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "user type updated successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAllFieldsUserById(this.props.user, data.updateUserType.userId, this.setUserDetails)
        } else if (data && data.addComment) {
            this.closeModal()
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "comment added successfully" })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAllFieldsUserById(this.props.user, data.addComment.userId, this.setUserDetails)
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong. \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.closeModal()
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.closeModal()
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
                    < div className='row'>
                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::session details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label>session id: {this.state.sessionId}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >start time: {this.state.startTime}</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label >end time: {this.state.endTime}</label>
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
                                    <label >payed: {this.state.payed}</label>
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

                            <div style={{ minHeight: 46 }}></div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={this.deleteSession} >
                                    delete session
                                    </button>
                            </div>
                        </div>

                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::update session::</h2>
                            <div className='separator'></div>
                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>
                            <div className='row even-space' style={{ width: '80%' }}>
                                <div style={{ width: '100%' }}>
                                    <label htmlFor="sessionId" >session id:</label>
                                    <input autoComplete='off' type="text" id="session-id" name="sessionId" onChange={this.updateInput} value={this.state.sessionId} readOnly/>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <select
                                    style={{ flexGrow: 1 }}
                                    id='avil-session-time'
                                    selectedValue={this.state.selAvilSessionTime}
                                    name='avilSessionTime'
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
                                <select style={{ flexGrow: 1 }} id='location-filter' name='selLocationFilter' value={this.props.searchFilter.selLocationFilter} onChange={this.updateFilterInput} >
                                    {
                                        this.props.searchFilter.locationFilterOptions.map(item => {
                                            return <option key={item.locationId} value={item.locationId}>{item.name}</option>
                                        })
                                    }
                                </select>
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="selActivityFilter" >activity:</label>
                                <select style={{ flexGrow: 1 }} id='activity-filter' name='selActivityFilter' value={this.props.searchFilter.selActivityFilter} onChange={this.updateFilterInput} >
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

                            <div style={{ minHeight: 58 }}></div>

                            <div className='row' style={{ width: '100%' }}>
                                <button style={{ 'flexGrow': 1 }} onClick={this.updateSession} >
                                    update session
                                    </button>
                            </div>
                        </div>

                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::transaction details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ 'width': '90%' }} >
                                <div className='col even-space' >
                                    <div>cost/min</div>
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
                                    <div>duration</div>
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
                                    <div>${this.state.costpm.toFixed(2)}</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div>-</div>
                                </div>
                                <div className='col even-space' >
                                    <div>{this.state.setupTime} [min]</div>
                                </div>
                                <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                    <div>X</div>
                                </div>
                                <div className='col even-space' >
                                    <div>{this.state.duration} [min]</div>
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
                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>

                            <div className='row even-space' style={{ width: '80%' }}>
                                <label htmlFor="transactionId" >trans id: #</label>
                                <input autoComplete='off' type="text" id="transaction-id" name="transactionId" onChange={this.updateInput} value={this.state.transactionId} readOnly/>
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

                            {this.state.payed &&
                                <div className='row' style={{ width: '100%' }}>
                                    <button style={{ 'flexGrow': 1 }} onClick={this.unpay} >
                                        mark unpayed
                                    </button>
                                </div>
                            }
                        </div>
                    </ div>
                </ div>
                <div className='section'>
                    <div className='row' style={{ flexGrow: 2, alignSelf: 'flex-start' }}>
                        <SessionTableDisplay parentState={this.state} parentProps={this.props} />
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
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(User);

