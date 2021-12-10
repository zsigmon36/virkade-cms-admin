import React, { Component } from 'react';
import Header from './fragments/Header.js'
import ConfirmationModal from './fragments/ConfirmationModal.js'
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SessionTableDisplay from "./fragments/SessionTableDisplay.js"
import SessionCreationDisplay from "./fragments/SessionCreationDisplay.js"
import validator from 'validator';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js';
import { pickerData } from '../../static/pickerData';
import alertAction from '../reduxActions/AlertAction.js';
import moment from "moment";
import * as DataConstants from "../dataAccess/DataConstants"

const defaultLocalState = {
    sessions: [],
    rawSessions: {},
    selUserId: 0,
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    emailAddress: '',
    type: '',
    typeCode: '',
    gender: '',
    age: 0,
    heightFt: 0,
    heightIn: 0,
    weight: 0,
    idp: 0,
    securityQuestion: '',
    securityAnswer: '',
    accountVerified: false,
    playedBefore: false,
    reServices: false,
    canContact: false,
    liableAgree: false,
    tcAgree: false,
    minor: false,
    ActiveTCLegal: { minor: false, pSig: undefined, gSig: undefined },
    ActiveLiabLegal: { minor: false, pSig: undefined, gSig: undefined },
    statusId: 0,

    generalComments: [],
    conditions: [],
    commentType: DataConstants.GENERAL_COMMENT_TYPE_CODE,
    commentContent: "",

    selState: 0,
    street: '',
    unit: '',
    apt: '',
    city: '',
    postalCode: '',
    addressTypeCode: DataConstants.PHYSICAL_ADDRESS_TYPE_CODE,

    number: '',
    countryCode: 0,
    phoneTypeCode: DataConstants.MOBILE_PHONE_TYPE_CODE,

    createSessionVisible: false,

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
        this.updateUser = this.updateUser.bind(this);
        this.addUserPhone = this.addUserPhone.bind(this);
        this.addUserAddress = this.addUserAddress.bind(this);
        this.setUserDetails = this.setUserDetails.bind(this);
        this.setPickerSates = this.setPickerSates.bind(this);
        this.confirmationAlert = this.confirmationAlert.bind(this);
        this.filterOptionsCallback = this.filterOptionsCallback.bind(this);
        this.demotePromote = this.demotePromote.bind(this);
        this.toggleAddSession = this.toggleAddSession.bind(this);
        this.addComment = this.addComment.bind(this);
        this.closeModal = this.closeModal.bind(this);
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

    toggleAddSession() {
        if (this.state.createSessionVisible) {
            this.setState({ createSessionVisible: false })
        } else {
            this.setState({ createSessionVisible: true })
        }
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
            DatabaseAPI.getAllUserSessions(this.props.user, value, this.props.searchFilter, this.setUserDetails)
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
            let comments = user.comments
            if (user) {
                Object.entries(user).forEach(([key, value]) => {
                    if (value) {
                        switch (key) {
                            case 'address':
                                newState.selState = value.state && value.state.stateId
                                newState.street = value.street
                                newState.unit = value.unit
                                newState.apt = value.apt
                                newState.city = value.city
                                newState.postalCode = value.postalCode
                                break
                            case 'phoneNumbers':
                                if (value.length > 0) {
                                    newState.countryCode = value[0].countryCode
                                    newState.number = value[0].number
                                }
                                break
                            case 'type':
                                newState.type = value.name
                                newState.typeCode = value.code
                                break
                            case 'status':
                                newState.statusId = value.statusId
                                break
                            case 'comments':
                                break
                            case 'sessions':
                                break
                            case 'height':
                                let heightFt = Math.floor(value / 12)
                                let heightIn = value % 12
                                newState.heightFt = heightFt
                                newState.heightIn = heightIn
                                break
                            default:
                                newState[key] = value;
                        }
                    }
                })
            } else {
                newState = Object.assign({}, defaultLocalState);
            }

            this.setState(newState);
            this.setComments(comments)
            this.loading(false)
        } else if (data && data.getAllUserSessions) {
            let sessions = data.getAllUserSessions
            let rawSessions = {}
            for (let index in sessions) {
                let session = sessions[index];
                rawSessions[session.sessionId] = session
            }
            this.setState({ rawSessions: rawSessions });
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

    addComment() {
        this.setState({
            modalTitle: '::complete the coment details::',
            modalBody:
                <div className='col'>
                    <div className='row even-space' style={{ width: '100%' }}>
                        <div className='row' style={{ width: '100%' }}>
                            <label htmlFor="commentType" >comment type:</label>
                            <select id='comment-type'
                                style={{ 'flexGrow': 1 }}
                                name="commentType"
                                onChange={this.updateInput}>
                                <option id={0} value={DataConstants.GENERAL_COMMENT_TYPE_CODE}>general notes</option>
                                <option id={1} value={DataConstants.CONDITIONS_COMMENT_TYPE_CODE}>conditions</option>
                            </select>
                        </div>
                    </div>
                    <div className='row even-space' style={{ width: '100%' }}>
                        <h3>:comment content:</h3>
                    </div>
                    <div className='row even-space' style={{ width: '100%' }} >
                        <textarea style={{ width: '100%' }} type='text' autoComplete='off' id="comment-content" name="commentContent" onChange={this.updateInput} required></textarea>
                    </div>
                </div>
            ,
            modalOnSubmit: () => this.persistComment(),
            modalOnClose: this.closeModal,
            modalIsOpen: true
        });
    }

    closeModal() {
        this.setState({ modalIsOpen: false })
    }

    persistComment() {
        let user = Object.assign({}, this.state);
        if (user.commentContent && user.commentContent !== '') {
            this.loading(true)
            DatabaseAPI.addUserComment(this.props.user, user, this.confirmationAlert)
        }
    }


    demotePromote() {
        this.loading(true)
        let user = Object.assign({}, this.state);
        if (this.state.typeCode === DataConstants.CUST_USER_TYPE_CODE) {
            user.typeCode = DataConstants.ADMIN_USER_TYPE_CODE
        } else {
            user.typeCode = DataConstants.CUST_USER_TYPE_CODE
        }
        DatabaseAPI.updateUserType(this.props.user, user, this.confirmationAlert)
    }

    updateUser() {
        let user = Object.assign({}, this.state);
        if (this.validateInput(user) && user.selUserId && user.selUserId > 0) {
            DatabaseAPI.updateUser(this.props.user, user, this.confirmationAlert)
        } else if (!user.selUserId || user.selUserId === 0) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: 'update requires a selected user' })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.loading(false)
        }
    }

    addUserPhone() {
        this.loading(true)
        let user = Object.assign({}, this.state);
        if (this.validateInput(this.state) && (user.selUserId && user.selUserId > 0) && (user.number.length > 0 || user.countryCode > 0)) {
            DatabaseAPI.addUserPhone(this.props.user, user, this.addUserAddress)
        } else {
            this.addUserAddress()
        }
    }

    addUserAddress() {
        let user = Object.assign({}, this.state);
        if (this.validateInput(this.state) && (user.selUserId && user.selUserId > 0) && (user.selState > 0 || user.street.length > 0 || user.city.length > 0 || user.postalCode.length > 0)) {
            DatabaseAPI.addUserAddress(this.props.user, user, this.updateUser)
        } else {
            this.updateUser()
        }

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
                    < div className='row'>
                        <div className='col border' style={{ minWidth: '33%', flexGrow: 1, padding: '0 10px 0 10px', margin: '0 10px 0 10px', alignSelf: 'flex-start' }}>
                            <h2>::user details::</h2>
                            <div className='separator'></div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="username" >user name:</label>
                                    <input autoComplete='off' type="text" id="username-user" name="username" onChange={this.updateInput} value={this.state.username} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="emailAddress" >email address:</label>
                                    <input autoComplete='off' type="text" id="email-address" name="emailAddress" onChange={this.updateInput} value={this.state.emailAddress} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="password" >password:</label>
                                    <input autoComplete='off' type="text" id="password" name="password" onChange={this.updateInput} value={this.state.password} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="securityQuestion" >security q:</label>
                                    <input autoComplete='off' type="text" id="security-question" name="securityQuestion" onChange={this.updateInput} value={this.state.securityQuestion} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="securityAnswer" >security a:</label>
                                    <input autoComplete='off' type="text" id="security-answer" name="securityAnswer" onChange={this.updateInput} value={this.state.securityAnswer} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="fistName">first name:</label>
                                    <input autoComplete='off' type="text" id="first-name-user" name="firstName" value={this.state.firstName} onChange={this.updateInput} />
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="lastName">last name:</label>
                                    <input autoComplete='off' type="text" id="last-name-user" name="lastName" value={this.state.lastName} onChange={this.updateInput} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
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

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="age" >age:</label>
                                    <input autoComplete='off' type="text" id="age" name="age" onChange={this.updateInput} value={this.state.age} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="heightFt" >height:</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <select
                                        name="heightFt"
                                        id="height-ft"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.heightFt}
                                        onChange={this.updateInput}>
                                        <option key={0} id={0} value={0}>sel foot</option>
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
                                        <option key={0} id={0} label="sel inch" value={0} ></option>
                                        {
                                            (pickerData.heightIn).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="weight" >weight:</label>
                                    <input autoComplete='off' type="text" id="weight" name="weight" onChange={this.updateInput} value={this.state.weight} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="idp" >eye space:</label>
                                    <select
                                        name="idp"
                                        id="idp"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.idp}
                                        onChange={this.updateInput}>
                                        <option key={0} id={0} label="select" value={0.0} ></option>
                                        {
                                            (pickerData.idp).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3>::physical address::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>


                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="street">street:</label>
                                    <input autoComplete='off' type="text" id="street" name="street" onChange={this.updateInput} value={this.state.street} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="apt" >apt:</label>
                                    <input autoComplete='off' type="text" id="apt" name="apt" onChange={this.updateInput} value={this.state.apt} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="unit" >unit:</label>
                                    <input autoComplete='off' type="text" id="unit" name="unit" onChange={this.updateInput} value={this.state.unit} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="city" >city:</label>
                                    <input autoComplete='off' type="text" id="city" name="city" onChange={this.updateInput} value={this.state.city} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="selState" >state:</label>
                                    <select
                                        name="selState"
                                        id="sel-state"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.selState}
                                        onChange={this.updateInput}>
                                        <option id={0} value={0}>select</option>
                                        {this.state.pickerStates}
                                    </select>
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="postalCode" >postal code:</label>
                                    <input autoComplete='off' type="text" id="postal-code" name="postalCode" onChange={this.updateInput} value={this.state.postalCode} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3>::mobile phone number::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="countryCode" >cc:</label>
                                    <select
                                        name="countryCode"
                                        id="country-code"
                                        value={this.state.countryCode}
                                        onChange={this.updateInput}
                                    >
                                        <option key={0} id={0} label="select" value={0} ></option>
                                        {
                                            (pickerData.phoneCountries).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                    <label htmlFor="number" >number:</label>
                                    <input style={{ 'width': 'inherit' }} autoComplete='off' type="text" id="phone-number" name="number" onChange={this.updateInput} value={this.state.number} />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3 >::contact preference::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="reServices">interested in VR real estate services</label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="re-services" name="reServices" value={this.state.reServices ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="canContact"> can we contact</label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="can-contact" name="canContact" value={this.state.canContact ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <h3 >::advanced options::</h3>
                                </div>
                            </div>

                            <div className='row even-space' style={{ maxWidth: 400 }}>
                                {this.state.validatorMsg}
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="accountVerified">account verified </label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="account-verified" name="accountVerified" value={this.state.accountVerified ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="playedBefore">has played before </label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="played-before" name="playedBefore" value={this.state.playedBefore ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="canContact">is a minor [read only]</label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="minor" name="minor" value={this.state.minor ? '[X]' : '[ ]'} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="tcAgree">agree to terms and conditions </label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="tc-agree" name="tcAgree" value={this.state.tcAgree ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label style={{ 'width': 300 }} htmlFor="liableAgree">agree to ltd liability waiver </label>
                                    <input style={{ 'width': 50 }} autoComplete='off' className="checkBox" type="text" id="liable-agree" name="liableAgree" value={this.state.liableAgree ? '[X]' : '[ ]'} onClick={this.updateInput} readOnly />
                                </div>
                            </div>

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="tcPsig">terms and conditions participant signature [read only]</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row border' style={{ width: '100%' }}>
                                    <img src={`data:image/png;base64,${this.state.ActiveTCLegal.pSig}`} id="tc-p-sig" name="tcPsig" alt="no sig found" />
                                </div>
                            </div>

                            {this.state.ActiveTCLegal.minor &&
                                <div className='row even-space' style={{ width: '75%' }}>
                                    <div className='row' style={{ width: '100%' }}>
                                        <label htmlFor="tcGsig">terms and conditions guardian signature [read only]</label>
                                    </div>
                                </div>
                            }
                            {this.state.ActiveTCLegal.minor &&
                                <div className='row even-space' style={{ width: '75%' }}>
                                    <div className='row border' style={{ width: '100%' }}>
                                        <img src={`data:image/png;base64,${this.state.ActiveTCLegal.gSig}`} id="tc-g-sig" name="tcGsig" alt="no sig found" />
                                    </div>
                                </div>
                            }
                            
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="liabPsig">ltb liability waiver participant signature [read only]</label>
                                </div>
                            </div>
                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row border' style={{ width: '100%' }}>
                                    <img src={`data:image/png;base64,${this.state.ActiveLiabLegal.pSig}`} id="liab-p-sig" name="liabPsig" alt="no sig found" />
                                </div>
                            </div>

                            {this.state.ActiveLiabLegal.minor &&
                                <div className='row even-space' style={{ width: '75%' }}>
                                    <div className='row' style={{ width: '100%' }}>
                                        <label htmlFor="liabGsig">ltb liability waiver guardian signature [read only]</label>
                                    </div>
                                </div>
                            }
                            {this.state.ActiveLiabLegal.minor &&
                                <div className='row even-space' style={{ width: '75%' }}>
                                    <div className='row border' style={{ width: '100%' }}>
                                        <img src={`data:image/png;base64,${this.state.ActiveLiabLegal.gSig}`} id="liab-g-sig" name="liabGsig" alt="no sig found" />
                                    </div>
                                </div>
                            }

                            <div className='row even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <label htmlFor="statusId" >status:</label>
                                    <select
                                        name="statusId"
                                        id="status"
                                        style={{ 'flexGrow': 1 }}
                                        value={this.state.statusId}
                                        onChange={this.updateInput}>
                                        <option id={0} value={0} >select</option>
                                        {
                                            (pickerData.status).map((item, index) => {
                                                return <option key={index + 1} id={index + 1} value={item.value} >{item.label}</option>
                                            })
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='col even-space' style={{ width: '75%' }}>
                                <div className='row' style={{ width: '100%' }}>
                                    <button style={{ 'flexGrow': 1 }} onClick={this.demotePromote} >
                                        {this.state.typeCode === DataConstants.ADMIN_USER_TYPE_CODE ? 'demote user to customer' : 'promote user to admin'}
                                    </button>
                                </div>
                            </div>

                        </div>

                        <div className='col' style={{ flexGrow: 2, alignSelf: 'flex-start' }}>
                            <SessionTableDisplay parentState={this.state} parentProps={this.props} />
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
                <SessionCreationDisplay parent={this} right={true} panelVisible={this.state.createSessionVisible} />
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

