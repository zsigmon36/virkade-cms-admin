import React, { Component } from 'react';
import alertAction from '../../reduxActions/AlertAction.js';
import searchFilterAction from '../../reduxActions/SearchFilterAction.js'
import sharedFlagsAction from '../../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from "moment";
import validator from 'validator';
import { DatabaseAPI } from '../../dataAccess/DatabaseAPI';

class SessionCreationDisplay extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        //this.scheduleSession = this.scheduleSession.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.setSessionOptions = this.setSessionOptions.bind(this);
    }

    state = {
        availableSessionsRaw: [],
        availableSessionsPicker: [],
        username: '',
        firstName: '',
        lastName: '',
        userId: '',
        selAvilSessionTime: 0,
    }
    componentDidMount() {
    }
    componentDidUpdate(oldProps) {
        if (this.state.userId !== this.props.parent.state.userId) {
            let newState = this.state
            newState.userId = this.props.parent.state.userId;
            newState.username = this.props.parent.state.username;
            newState.firstName = this.props.parent.state.firstName;
            newState.lastName = this.props.parent.state.lastName;
            this.setState({ state: newState })
        } 
        if (this.props.panelVisible && oldProps.panelVisible !== this.props.panelVisible){
            DatabaseAPI.getAvailableSessions(this.props.parent.props.user, this.props.searchFilter, this.setSessionOptions)
        }
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
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
            this.setState({ 'availableSessionsRaw': data.getAvailableSessions })
            this.setState({ 'availableSessionsPicker': pickerItems })
        }
        else {
            this.setState({ 'availableSessionsRaw': [] })
            this.setState({ 'availableSessionsPicker': [] })
        }
        this.loading(false)
    }

    validateInput(data, isAlert = true) {
        let { userId, selAvilSessionTime, availableSessionsPicker } = data
        let selLocation = this.props.searchFilter.selLocationFilter
        let selActivity = this.props.searchFilter.selActivityFilter
        let msg = '';
        let isValid = true
        if (availableSessionsPicker === undefined || availableSessionsPicker.length <= 0) {
            msg = 'no sessions available'
            isValid = false;
        } else if (selAvilSessionTime === undefined || selAvilSessionTime < 0) {
            msg = 'must select at least one play session'
            isValid = false;
        } else if (selLocation === undefined || selLocation === "") {
            msg = 'valid location must be selected'
            isValid = false;
        } else if (selActivity === undefined || selActivity === "") {
            msg = 'valid activity must be selected'
            isValid = false;
        } else if (userId === undefined || userId === '' || !validator.isNumeric(String(userId) || parseInt(userId) <= 0)) {
            msg = 'valid user must be selected'
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
            DatabaseAPI.getAvailableSessions(this.props.parent.props.user, filter, this.setSessionOptions)
        } else {
            this.setState({ [key]: value })
        }
    }

    scheduleSession(sessionTime) {
        if (this.validateInput(this.state, true)) {
            let session = this.state.availableSessionsRaw[sessionTime]
            session.username = this.state.username
            this.loading(true)
            DatabaseAPI.addUserSession(this.props.parent.props.user, session, this.confirmationAlert)
        }
    }

    confirmationAlert(data, error) {
        if (data && data.addUserSession && data.addUserSession.sessionId) {
            //set real session id
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: `session has been scheduled, \nsession Id: ${data.addUserSession.sessionId} ` })
            this.props.sharedFlagsAction({ alertOpen: true });
            DatabaseAPI.getAvailableSessions(this.props.parent.props.user, this.props.searchFilter, this.setSessionOptions)
            DatabaseAPI.getAllUserSessions(this.props.parent.props.user, this.props.parent.state.selUserId, this.props.searchFilter, this.props.parent.setUserDetails)
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
        let session = this.state.availableSessionsRaw[this.state.selAvilSessionTime]
        let startDate = session && moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
        let endDate = session && moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
        let duration = session ? ((endDate.clone()).subtract(startDate.clone()) / 1000) / 60 : 0
        let setupTime = session ? session.activity.setupMin : 0
        let costpm = session && (session.activity.costpm)
        let taxRate = session && (session.location.taxRate)

        let sessionTotal = session ? ((duration - setupTime) * costpm * (1 + taxRate)).toFixed(2) : 0.00

        return (

            <div className='border' style={{ display: 'block', padding: '0 10px 0 10px', margin: '0 10px 5px 10px', boxSizing: 'border-box' }}>
                <div className={`${this.props.right ? 'side-panel-right' : 'side-panel'} border`}
                    style={this.props.panelVisible ? (
                        this.props.right ? { right: 0 } : { left: 0 }
                    ) : (
                            this.props.right ? { right: '-50%' } : { left: '-50%' }
                        )}>
                    <div className='section' style={{ 'width': '100%' }}>
                        <h2>::schedule session::</h2>
                        <div className='separator'></div>

                        <div className='row even-space' >
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

                        <div className='row even-space' >
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
                        <div className='separator'></div>

                        <div className='row' style={{ width: '100%' }}>
                            <button className='bigBorder' style={{ 'flexGrow': 1 }} onClick={() => this.scheduleSession(this.state.selAvilSessionTime)} >
                                first aviliable
                            </button>
                        </div>
                        <div className='row even-space' >
                            <div className='row' style={{ width: '100%' }}>
                                <label>-- or --</label>
                            </div>
                        </div>
                        <div className='row even-space' >
                            <div className='row' style={{ width: '100%' }}>
                                <label>:: pick a time below ::</label>
                            </div>
                        </div>

                        <div className='row even-space' >
                            <select
                                style={{ flexGrow: 1, borderLeft: 'none', borderRight: 'none' }}
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

                        <div className='row even-space'>&nbsp;</div>

                        <div className='row even-space' >
                            <div className='row' style={{ width: '100%' }}>
                                <label htmlFor="firstName" >first name:</label>
                                <input autoComplete='off' type="text" id="first-name" name="firstName" onChange={this.updateInput} value={this.state.firstName} readOnly />
                            </div>
                        </div>
                        <div className='row even-space' >
                            <div className='row' style={{ width: '100%' }}>
                                <label htmlFor="lastName" >last name:</label>
                                <input autoComplete='off' type="text" id="last-name" name="lastName" onChange={this.updateInput} value={this.state.lastName} readOnly />
                            </div>
                        </div>
                        <div className='row even-space' >
                            <div className='row' style={{ width: '100%' }}>
                                <label htmlFor="username" >username:</label>
                                <input autoComplete='off' type="text" id="username" name="username" onChange={this.updateInput} value={this.state.username} readOnly />
                            </div>
                        </div>

                        <div className='row even-space'>&nbsp;</div>
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
                                <div>${costpm ? costpm.toFixed(2) : (0.00).toFixed(2)}</div>
                            </div>
                            <div className='col even-space' style={{ 'flexGrow': 0.5 }}>
                                <div>X</div>
                            </div>
                            <div className='col even-space' >
                                <div>{taxRate ? taxRate.toFixed(3) : (0.000).toFixed(3)}%</div>
                            </div>
                        </div>
                        <div className='separator'></div>
                        <div className='row even-space' >
                            <div>session total: ${sessionTotal}</div>
                        </div>

                        <div className='row even-space'>&nbsp;</div>

                        <div className='row even-space' style={{ width: '100%' }}>
                            <button className='bigBorder' style={{ 'flexGrow': 1 }} onClick={() => this.scheduleSession(this.state.selAvilSessionTime)} >
                                schedule session
                                    </button>
                        </div>

                        <div className='row even-space' style={{ width: '100%' }}>
                            <button className='bigBorder' style={{ 'flexGrow': 1 }} onClick={() => { this.props.parent.toggleAddSession() }} >
                                cancel
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

export default connect(mapStateToProps, mapDispatchToProps)(SessionCreationDisplay);