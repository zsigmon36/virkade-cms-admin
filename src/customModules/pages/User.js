import React, { Component } from 'react';
import Header from './fragments/Header.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import searchFilterAction from '../reduxActions/SearchFilterAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from "react-router-dom"
import { ROUTES } from '../VirkadeAdminPages.js';
import validator from 'validator';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import { pickerData } from '../../static/pickerData';
import alertAction from '../reduxActions/AlertAction.js';
import moment from "moment";
import * as DataConstants from "../dataAccess/DataConstants"

const defaultLocalState = {
    sessions: [],
    selUserId: 0,
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    emailAddress: '',
    type: '',
    gender: '',
    age: '',
    heightFt: '',
    heightIn: '',
    weight: '',
    idp: '',
    securityQuestion: '',
    securityAnswer: '',
    emailVerified: false,
    playedBefore: false,
    reServices: false,
    canContact: false,
    liableAgree: false,
    tcAgree: false,
    status: '',
    generalComments: [],
    conditions: [],

    selState: 0,
    street: '',
    unit: '',
    apt: '',
    city: '',
    postalCode: '',

    number: '',
    countryCode: '',
}

class User extends Component {

    constructor(props) {
        super(props)
        this.updateInput = this.updateInput.bind(this);
        this.setUserDetails = this.setUserDetails.bind(this);
        this.setPickerSates = this.setPickerSates.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.setSessionRows = this.setSessionRows.bind(this);
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        this.loading(true)
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let id = urlParams.get('id');
            let event = {
                target: {
                    name: 'selUserId',
                    value: parseInt(id)
                }
            }
            this.updateInput(event)
        }
        DatabaseAPI.getAllStates(this.props.user, this.setPickerSates)
    }

    setSessionRows(data) {
        let sessions = [];
        if (data && data.length > 0) {
            sessions.push(
                <div key={0} className='table row'>
                    <div className='th' style={{ flexGrow: 0.5 }}>payed</div>
                    <div className='th' style={{ flexGrow: 0.5 }}>id</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>start time</div>
                    <div className='th' style={{ flexGrow: 1.5 }}>end time</div>
                    <div className='th'>location</div>
                    <div className='th'>activity</div>
                </div>
            );
            (data).map((session, index) => {
                let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('LLL')
                endDate = endDate.format('LLL')
                let { payed, sessionId } = session
                let locName = session.location.name;
                let locId = session.location.locationId;
                let actName = session.activity.name;
                let actId = session.activity.activityId;
                let counter = index + 1

                let curStateKey = `payedStatus${counter}`
                this.setState({ [curStateKey]: payed });
                let isAlt = index % 2 === 0 ? 'alt' : 'reg'
                sessions.push(
                    <div key={counter} className={`table row ${isAlt}`}>
                        <div className='tr' style={{ flexGrow: 0.5 }}>
                            <input autoComplete='off' style={{ width: 50 }} className={`checkBox ${isAlt}`} type="text" id={`session-payed-${index}`} name={`sessionPayed${index}`} value={this.state[curStateKey] ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                        </div>
                        <div className='tr' style={{ flexGrow: 0.5 }}><Link to={{
                            pathname: ROUTES.SESSION_PAGE,
                            search: `?id=${sessionId}`
                        }}>{sessionId}</Link></div>
                        <div className='tr' style={{ flexGrow: 1.5 }} >{startDate}</div>
                        <div className='tr' style={{ flexGrow: 1.5 }} >{endDate}</div>
                        <div className='tr'><Link to={{
                            pathname: ROUTES.LOCATION_PAGE,
                            search: `?id=${locId}`
                        }}>{locName}</Link></div>
                        <div className='tr'><Link to={{
                            pathname: ROUTES.ACTIVITY_PAGE,
                            search: `?id=${actId}`
                        }}>{actName}</Link></div>
                    </div>
                )
                return true;
            });
        } else {
            sessions.push(
                <div key={0} className='table row'>
                    <div className='th center'>:no sessions:</div>
                </div>
            );
        }
        this.setState({ 'sessions': sessions })
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
        if (value === '[ ]') {
            value = true;
        } else if (value === '[X]') {
            value = false;
        }
        this.setState({ [key]: value })
        this.validateInput({ [key]: value }, false)
        if (key === 'selUserId') {
            DatabaseAPI.getAllFieldsUserById(this.props.user, value, this.setUserDetails)
        }
    }

    setPickerSates(data) {
        let pickerItems = [];
        if (data.getAllStates) {
            (data.getAllStates).map(item => {
                pickerItems.push(<option key={item.stateCode} value={item.stateId}>{item.name}</option>)
                return true;
            })
        }
        this.setState({ 'pickerStates': pickerItems })
    }

    setUserDetails(data, error) {
       
        if (data && data.getUserById) {
            let newState = Object.assign({}, this.state);
            let user = data.getUserById
            let sessions = user.sessions
            let comments = user.comments
            if (user) {
                Object.entries(user).forEach(([key, value]) => {
                    switch (key) {
                        case 'address':
                            newState.selState = value.state.stateId
                            newState.street = value.street
                            newState.unit = value.unit
                            newState.apt = value.apt
                            newState.city = value.city
                            newState.postalCode = value.postalCode
                            break
                        case 'phoneNumbers':
                            newState.countryCode = value[0].countryCode
                            newState.number = value[0].number
                            break
                        case 'type':
                            newState.type = value.name
                            break
                        case 'status':
                            newState.status = value.name
                            break
                        case 'comments':
                            break
                        case 'sessions':
                            break
                        case 'height':
                            let heightFt = Math.floor(value / 12)
                            let heightIn = value % 12
                            newState.heightFt = String(heightFt)
                            newState.heightIn = String(heightIn)
                            break
                        default:
                            newState[key] = value;
                    }
                })
            } else {
                newState = Object.assign({}, defaultLocalState);
            }
            this.setState(newState);
            this.setSessionRows(sessions)
            this.setComments(comments)
            this.loading(false)
        } else if (error) {
            console.error(`hmmm... \nlooks like something went wrong.  \n${error[0].message}`)
            this.loading(false)
        } else {
            console.error(`hmmm... \nlooks like something went wrong.`)
            this.loading(false)
        }
    }

    setComments(data) {
       
        let conditions = [];
        let generalComments = [];

        Object.entries(data).forEach(([key, value]) => {
            let isAlt = key % 2 === 0 ? 'alt' : 'reg'
            let commentType = data[key].type.code

            let createdAt = moment(data[key].audit.createdAt, 'yyyy-MM-DD hh:mm:ss.S')
            createdAt = createdAt.format('LLLL')

            if (commentType === DataConstants.CONDITIONS_COMMENT_TYPE_CODE) {
                conditions.push(<div className={`infoCard  ${isAlt}`} key={key}>{`[ ${createdAt} ] : ${data[key].commentContent.replaceAll(DataConstants.NEW_LINE_TOKEN, " ")} `}</div>)
            } else {
                generalComments.push(<div className={`infoCard  ${isAlt}`} key={key}>{`[ ${createdAt} ] : ${data[key].commentContent.replaceAll(DataConstants.NEW_LINE_TOKEN, " ")} `}</div>)
            }
        })
        this.setState({ 'generalComments': generalComments })
        this.setState({ 'conditions': conditions })
    }

    addUser() {
        if (this.validateInput(this.state)) {
            let curState = Object.assign({}, this.state);
            curState.selActivityFilter = 0;
            DatabaseAPI.addUpdateActivity(this.props.user, curState, this.confirmationAlert)
        }
    }

    updateUser() {
        if (this.validateInput(this.state) && this.state.selActivityFilter && this.state.selActivityFilter > 0) {
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
                <Header history={this.props.history} />
                <div className='section'>
                    < div className='row'>
                        <div className='col border' style={{ flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::user details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="username" >user name:</label>
                                    <input autoComplete='off' type="text" id="username" name="username" onChange={this.updateInput} value={this.state.username} readOnly/>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="emailAddress" >email address:</label>
                                    <input autoComplete='off' type="text" id="email-address" name="emailAddress" onChange={this.updateInput} value={this.state.emailAddress} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="password" >password:</label>
                                    <input autoComplete='off' type="text" id="password" name="password" onChange={this.updateInput} value={this.state.password} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="securityQuestion" >security q:</label>
                                    <input autoComplete='off' type="text" id="security-question" name="securityQuestion" onChange={this.updateInput} value={this.state.securityQuestion} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="securityAnswer" >security a:</label>
                                    <input autoComplete='off' type="text" id="security-answer" name="securityAnswer" onChange={this.updateInput} value={this.state.securityAnswer} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="fistName">first name:</label>
                                    <input autoComplete='off' type="text" id="first-name" name="firstName" value={this.state.firstName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="lastName">last name:</label>
                                    <input autoComplete='off' type="text" id="last-name" name="lastName" value={this.state.lastName} onChange={this.updateInput} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="gender" >gender you identify:</label>
                                    <select id='gender-select'
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.gender}
                                        name="gender"
                                        onChange={this.updateInput}>
                                        <option id={0} value="">select</option>
                                        <option id={1} value="m">male</option>
                                        <option id={2} value="f">female</option>
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="age" >age:</label>
                                    <input autoComplete='off' type="text" id="age" name="age" onChange={this.updateInput} value={String(this.state.age)} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="heightFt" >height:</label>
                                    <select
                                        name="heightFt"
                                        id="height-ft"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.heightFt}
                                        onChange={this.updateInput}>
                                        <option key={0} id={0} value="0">sel foot</option>
                                        {
                                            (pickerData.heightFt).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                    <select
                                        name="heightIn"
                                        id="height-in"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.heightIn}
                                        onChange={this.updateInput}>
                                        <option key={0} id={0} label="sel inch" value="0" ></option>
                                        {
                                            (pickerData.heightIn).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="weight" >weight:</label>
                                    <input autoComplete='off' type="text" id="weight" name="weight" onChange={this.updateInput} value={String(this.state.weight)} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="idp" >eye space:</label>
                                    <select
                                        name="idp"
                                        id="idp"
                                        style={{ 'flexGrow': 1 }}
                                        value={String(this.state.idp)}
                                        onChange={this.updateInput}>
                                        <option key={0} id={0} label="select" value="0.0" ></option>
                                        {
                                            (pickerData.idp).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    {this.state.validatorMsg}
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3>::physical address::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="street">street:</label>
                                    <input autoComplete='off' type="text" id="street" name="street" onChange={this.updateInput} value={this.state.street} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="apt" >apt:</label>
                                    <input autoComplete='off' type="text" id="apt" name="apt" onChange={this.updateInput} value={this.state.apt} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="unit" >unit:</label>
                                    <input autoComplete='off' type="text" id="unit" name="unit" onChange={this.updateInput} value={this.state.unit} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="city" >city:</label>
                                    <input autoComplete='off' type="text" id="city" name="city" onChange={this.updateInput} value={this.state.city} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="selState" >state:</label>
                                    <select
                                        name="selState"
                                        id="sel-state"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.selState}
                                        onChange={this.updateInput}>
                                        <option id={0} value="" >select</option>
                                        {this.state.pickerStates}
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="postalCode" >postal code:</label>
                                    <input autoComplete='off' type="text" id="postal-code" name="postalCode" onChange={this.updateInput} value={this.state.postalCode} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label>{this.state.validatorMsg}</label>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3>::mobile phone number::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="countryCode" >cc:</label>
                                    <select
                                        name="countryCode"
                                        id="country-code"
                                        value={this.state.countryCode}
                                        onChange={this.updateInput}
                                    >
                                        <option key={0} id={0} label="select" value='0' ></option>
                                        {
                                            (pickerData.phoneCountries).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                    <label htmlFor="phoneNumber" >number:</label>
                                    <input style={{ 'width': 'inherit'}} autoComplete='off' type="text" id="phone-number" name="phoneNumber" onChange={this.updateInput} value={this.state.number} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3 >::contact preference::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{'width': 300}} htmlFor="reServices">interested in VR real estate services?</label>
                                    <input style={{'width': 50}} autoComplete='off' className="checkBox" type="text" id="re-services" name="reServices" value={this.state.reServices ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '65%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{'width': 300}} htmlFor="canContact"> can we contact you? </label>
                                    <input style={{'width': 50}} autoComplete='off' className="checkBox" type="text" id="can-contact" name="canContact" value={this.state.canContact ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>


                        </div>

                        <div className='col' style={{ flexGrow: 2, alignSelf: 'flex-start' }}>
                            <div className='border' style={{ display: 'block', width: '100%', padding: '0 10px 0 10px', margin: '0 10px 5px 10px', boxSizing: 'border-box' }}>
                                <h2>::sessions::</h2>
                                <div className='separator'></div>
                                {this.state.sessions}
                            </div>
                            <div className='border' style={{ display: 'block', width: '100%', padding: '0 10px 0 10px', margin: '5px 10px 5px 10px', boxSizing: 'border-box' }}>
                                <h2>::conditions::</h2>
                                <div className='separator'></div>
                                {this.state.conditions}

                            </div>
                            <div className='border' style={{ display: 'block', width: '100%', padding: '0 10px 0 10px', margin: '5px 10px 5px 10px', boxSizing: 'border-box' }}>
                                <h2>::general notes::</h2>
                                <div className='separator'></div>
                                {this.state.generalComments}
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


export default connect(mapStateToProps, mapDispatchToProps)(User);

