import React, { Component } from 'react';
import userAction from '../../reduxActions/UserAction'
import { ROUTES } from '../../VirkadeAdminPages.js';
import alertAction from '../../reduxActions/AlertAction.js';
import searchFilterAction from '../../reduxActions/SearchFilterAction.js'
import sharedFlagsAction from '../../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from "react-router-dom"
import moment from "moment";

class SessionTableDisplay extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.payedSessionAlert = this.payedSessionAlert.bind(this);
    }

    state = {
        payPanelVisible: false,
        transactionId: "",
        selectedSessions: [],
        sessions: this.props.parentState.rawSessions || {},
        transactionTotal: 0,
    }

    payedSessionAlert() {
        this.props.alertAction({ type: 'info' })
        this.props.alertAction({ msg: "go to session page to mark unpayed" })
        this.props.sharedFlagsAction({ alertOpen: true });
    }

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        let payPanelVisible = false;
        let selectedSessions = []
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
                let duration = ((endDate.clone()).subtract(startDate.clone())/1000)/60
                let setupTime = session.activity.setupMin
                let costpm = session.activity.costpm
                let taxRate = session.location.taxRate

                let sessionTotal = ((duration - setupTime) * costpm * (1 + taxRate))
                
                transactionTotal += sessionTotal
                selectedSessions.push(
                    <div className='infoCard border' style={{ 'flexDirection': 'column', 'alignItems': 'flex-start' }} key={curSelectSession} >
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
                        <div className='row even-space' style={{ 'width': '100%' }}>
                            <div className='col even-space' >
                                <div>${costpm.toFixed(2)}</div>
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
                                <div>{duration} [min]</div>
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
        this.setState({ transactionTotal })
    }

    render() {
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
                    Object.keys(this.state.sessions).map((key, index) => (

                        <div key={this.state.sessions[key].sessionId} className={`table row ${index % 2 === 0 ? 'alt' : 'reg'}`}>
                            <div className='tr' style={{ flexGrow: 0.5 }}>
                                <input autoComplete='off' style={{ width: 50 }}
                                    className={`checkBox ${index % 2 === 0 ? 'alt' : 'reg'}`}
                                    type="text"
                                    id={`payed-status-${this.state.sessions[key].sessionId}`}
                                    name={`payedStatus${this.state.sessions[key].sessionId}`}
                                    value={this.state[`payedStatus${this.state.sessions[key].sessionId}`] ? '[X]' : '[ ]'}
                                    onClick={this.state.sessions[key].sessionId.payed ? this.payedSessionAlert : this.updateInput}
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

                <div className='payment-panel border' style={this.state.payPanelVisible ? { left: 0 } : { left: '-30%' }}>
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
                            <label htmlFor="transactionId" >transaction id:</label>
                            <input autoComplete='off' type="text" id="transactionId" name="transactionId" onChange={this.updateInput} value={this.state.transactionId} readOnly />
                        </div>
                        <div className='row even-space'>
                            <div >transaction total: ${this.state.transactionTotal.toFixed(2)}</div>
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
        //sessions: ownProps.sessions
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