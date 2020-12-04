import React, { Component } from 'react';
//import userAction from '../../reduxActions/UserAction'
import { pickerData } from '../../../static/pickerData';
import { ROUTES } from '../../VirkadeAdminPages.js';
import alertAction from '../../reduxActions/AlertAction.js';
import searchFilterAction from '../../reduxActions/SearchFilterAction.js'
import sharedFlagsAction from '../../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from "react-router-dom"
import moment from "moment";
import validator from 'validator';
import { DatabaseAPI } from '../../dataAccess/DatabaseAPI';

class SessionTableDisplay extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.payedSessionAlert = this.payedSessionAlert.bind(this);
        this.processPayment = this.processPayment.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
    }

    state = {
        payPanelVisible: false,
        transactionId: "",
        selectedSessions: [],
        selectedSessionIds: [],
        sessions: this.props.parentState.rawSessions || {},
        transactionTotal: 0,
        serviceName: 0,
        refId: '',
        payment: '',
        paymentDescription: '',

    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    payedSessionAlert() {
        this.props.alertAction({ type: 'info' })
        this.props.alertAction({ msg: "to mark unpayed, select id and update on play-session page transaction details" })
        this.props.sharedFlagsAction({ alertOpen: true });
    }

    validateInput(data, isAlert = true) {
        let { serviceName, refId, payment, selectedSessions } = data
        let msg = '';
        let isValid = true

        if (selectedSessions.length <= 0) {
            msg = 'must select at least one play session'
            isValid = false;
        } else if (serviceName <= 0) {
            msg = 'payment type must be selected'
            isValid = false;
        } else if (refId === undefined || refId === '' || !validator.isNumeric(String(refId))) {
            msg = 'ref id must not be empty and is expected to be numeric'
            isValid = false;
        } else if (payment === undefined || payment === '' || !validator.isCurrency(String(payment))) {
            msg = 'payment amount has to be a valid currency'
            isValid = false;
        } else if (payment !== this.state.transactionTotal.toFixed(2)) {
            msg = 'payment amount must match the transaction total [for now].  If you needed to do some multiple transaction payment then please note the details in the description'
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
        let payPanelVisible = false;
        let selectedSessions = []
        let selectedSessionIds = []
        if (value === '[ ]') {
            value = true;
        } else if (value === '[X]') {
            value = false;
        }
        let curState = Object.assign({}, this.state)
        curState[key] = value
        let transactionTotal = 0;
        for (const key in curState) {
            if (key.startsWith('payedStatus') && curState[key]) {
                let curSelectSession = key.slice('payedStatus'.length, key.length)
                payPanelVisible = true;
                let session = this.state.sessions[curSelectSession];
                let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                let duration = ((endDate.clone()).subtract(startDate.clone()) / 1000) / 60
                let setupTime = session.activity.setupMin
                let costpm = session.activity.costpm
                let taxRate = session.location.taxRate

                let sessionTotal = ((duration - setupTime) * costpm * (1 + taxRate))

                transactionTotal += sessionTotal
                selectedSessionIds.push(session.sessionId)
                selectedSessions.push(
                    <div className='infoCard border bigBorder' style={{ 'flexDirection': 'column', 'alignItems': 'flex-start' }} key={curSelectSession} >
                        <div className='row even-space' >
                            <div>session id: {session.sessionId}</div>
                        </div>
                        <div className='row even-space' >
                            <div>start: {startDate.format('LLLL')}</div>
                        </div>
                        <div className='row even-space' >
                            <div>end: {endDate.format('LLLL')}</div>
                        </div>
                        <div className='row even-space' >
                            <div>activity: {session.activity.name}</div>
                        </div>
                        <div className='row even-space' >
                            <div>location: {session.location.name}</div>
                        </div>
                        <div className='separator'></div>

                        <div className='row even-space' style={{ 'width': '100%' }} >
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
                        <div className='row even-space' style={{ 'width': '100%' }}>
                            <div className='col even-space' >
                                <div>{duration} [min]</div>
                            </div>
                            <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                <div>-</div>
                            </div>
                            <div className='col even-space' >
                                <div>{setupTime} [min]</div>
                            </div>
                            <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                <div>X</div>
                            </div>
                            <div className='col even-space' >
                                <div>${costpm.toFixed(2)}</div>
                            </div>
                            <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                <div>X</div>
                            </div>
                            <div className='col even-space' >
                                <div>{taxRate.toFixed(3)}%</div>
                            </div>
                        </div>
                        <div className='separator'></div>
                        <div className='row even-space' >
                            <div>session total: ${sessionTotal.toFixed(2)}</div>
                        </div>
                    </div>
                )
            }
        }
        this.setState({ [key]: value })
        this.setState({ payPanelVisible })
        this.setState({ selectedSessions })
        this.setState({ selectedSessionIds })
        this.setState({ transactionTotal })
    }

    processPayment() {
        if (this.validateInput(this.state, true)) {
            this.loading(true)
            let newState = Object.assign({}, this.state)
            for (let i in pickerData.serviceName) {
                if (pickerData.serviceName[i].value === parseInt(newState.serviceName)) {
                    newState.serviceName = pickerData.serviceName[i].label
                    break;
                }
            }
            DatabaseAPI.addUpdateTransaction(this.props.parentProps.user, newState, this.confirmationAlert)
        }
    }

    confirmationAlert(data, error) {
        if (data && (data.addUpdateTransaction)) {
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: "transaction created successfully" })
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
        this.loading(false)
    }

    render() {
        let rawSessions = this.state.sessions
        let filterSessions = {};
        let { selActivityFilter, selLocationFilter, selPayedFilter } = this.props.searchFilter
        Object.keys(rawSessions).map((key) => {
            let sessionLocId = rawSessions[key].location.locationId
            let sessionActId = rawSessions[key].activity.activityId
            let filterActId = selActivityFilter === "" ? sessionActId : parseInt(selActivityFilter)
            let filterLocId = selLocationFilter === "" ? sessionLocId : parseInt(selLocationFilter)
            let notPayedFilter = selPayedFilter === "not payed"
            let sessionPayed = rawSessions[key].payed
            if (sessionLocId === filterLocId && sessionActId === filterActId && (!notPayedFilter || (!sessionPayed && notPayedFilter))) {
                filterSessions[key] = rawSessions[key]
            }
            return true
        })
        return (
            <div className='border' style={{ display: 'block', width: '100%', padding: '0 10px 0 10px', margin: '0 10px 5px 10px', boxSizing: 'border-box' }}>
                <h2>::sessions::</h2>
                <div className='separator'></div>
                <div className='table row'>
                    <div className='th' style={{ flexGrow: 0.5 }}>payed</div>
                    <div className='th' style={{ flexGrow: 0.5 }}>id</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>start time</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>end time</div>
                    <div className='th'>location</div>
                    <div className='th'>activity</div>
                </div>
                {
                    Object.keys(filterSessions).map((key, index) => (

                        <div key={this.state.sessions[key].sessionId} className={`table row ${index % 2 === 0 ? 'alt' : 'reg'} ${this.state.sessions[key].payed ? 'bold' : ''}`}>
                            <div className='tr' style={{ flexGrow: 0.5 }}>
                                <input autoComplete='off' style={{ width: 50 }}
                                    className={`checkBox ${index % 2 === 0 ? 'alt' : 'reg'} ${this.state.sessions[key].payed ? 'boldCheckbox' : ''}`}
                                    type="text"
                                    id={`payed-status-${this.state.sessions[key].sessionId}`}
                                    name={`payedStatus${this.state.sessions[key].sessionId}`}
                                    value={this.state.sessions[key].payed ? '[X]' : (this.state[`payedStatus${this.state.sessions[key].sessionId}`] ? '[X]' : '[ ]')}
                                    onClick={this.state.sessions[key].payed ? this.payedSessionAlert : this.updateInput}
                                    readOnly />
                            </div>
                            <div className='tr' style={{ flexGrow: 0.5 }}><Link to={{
                                pathname: ROUTES.SESSION_PAGE,
                                search: `?id=${this.state.sessions[key].sessionId}`
                            }}>{this.state.sessions[key].sessionId}</Link></div>
                            <div className='tr' style={{ flexGrow: 1.5 }} >{moment(this.state.sessions[key].startDate, 'yyyy-MM-DD hh:mm:ss.S').format('lll')}</div>
                            <div className='tr' style={{ flexGrow: 1.5 }} >{moment(this.state.sessions[key].endDate, 'yyyy-MM-DD hh:mm:ss.S').format('lll')}</div>
                            <div className='tr'><Link to={{
                                pathname: ROUTES.LOCATION_PAGE,
                                search: `?id=${this.state.sessions[key].location.locationId}`
                            }}>{this.state.sessions[key].location.name}</Link></div>
                            <div className='tr'><Link to={{
                                pathname: ROUTES.ACTIVITY_PAGE,
                                search: `?id=${this.state.sessions[key].activity.activityId}`
                            }}>{this.state.sessions[key].activity.name}</Link></div>
                        </div>

                    ))
                }
                {(!this.state.sessions || Object.keys(this.state.sessions).length === 0) &&
                    <div className='table row'>
                        <div className='th center'>:no sessions:</div>
                    </div>
                }

                <div className={`${this.props.right ? 'payment-panel-right' : 'payment-panel'} border`}
                    style={this.state.payPanelVisible ? (
                        this.props.right ? { right: 0 } : { left: 0 }
                    ) : (
                            this.props.right ? { right: '-50%' } : { left: '-50%' }
                        )}>
                    <div className='section' style={{ 'width': '100%' }}>
                        <div className='row even-space' >
                            <h2>::payment::</h2>
                        </div>
                        <div className='separator'></div>

                        <div className='row even-space' >
                            <h3>:selected sessions:</h3>
                        </div>

                        {this.state.selectedSessions}

                        <div className='row even-space' >
                            <h3>:transaction details:</h3>
                        </div>
                        <div className='separator'></div>

                        <div className='row even-space'>
                            <h4 >transaction total: ${this.state.transactionTotal.toFixed(2)}</h4>
                        </div>

                        <div className='row even-space'>
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

                        <div className='row even-space'>
                            <label htmlFor="refId" >reference id: #</label>
                            <input autoComplete='off' type="text" id="ref-id" name="refId" onChange={this.updateInput} value={this.state.refId} />
                        </div>

                        <div className='row even-space'>
                            <label htmlFor="payment" >payment total: $</label>
                            <input autoComplete='off' type="text" id="payment" name="payment" onChange={this.updateInput} value={this.state.payment} />
                        </div>

                        <div className='row even-space' >
                            <label htmlFor="paymentDescription">:description &amp; comments:</label>
                        </div>
                        <div className='row even-space' >
                            <textarea style={{ width: '100%', height: 75 }} type='text' autoComplete='off' id="payment-description" name="paymentDescription" onChange={this.updateInput} value={this.state.paymentDescription} required></textarea>
                        </div>

                        <div className='row' style={{ width: '100%' }}>
                            <button className='bigBorder' style={{ 'flexGrow': 1 }} onClick={this.processPayment} >
                                submit payment details
                                    </button>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        //user: state.user,
        //sessions: ownProps.sessions
        searchFilter: state.searchFilter,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        //actions: bindActionCreators(userAction, dispatch),
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
        alertAction: bindActionCreators(alertAction, dispatch),
        searchFilterAction: bindActionCreators(searchFilterAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SessionTableDisplay);