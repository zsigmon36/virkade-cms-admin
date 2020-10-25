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
    selSessionId: 0,
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
    emailVerified: false,
    playedBefore: false,
    reServices: false,
    canContact: false,
    liableAgree: false,
    tcAgree: false,
    statusId: 0,
    generalComments: [],
    conditions: [],

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
}

class PlaySession extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this)
        this.state = Object.assign({}, defaultLocalState);
    }

    componentDidMount() {
        if (this.props.location && this.props.location.search) {
            let search = this.props.location.search;
            let urlParams = new URLSearchParams(search);
            let id = urlParams.get('userId');
            let event = {
                target: {
                    name: 'selUserId',
                    value: parseInt(id)
                }
            }
            this.updateInput(event)
            id = urlParams.get('sessionId');
            event = {
                target: {
                    name: 'selSessionId',
                    value: parseInt(id)
                }
            }
            this.updateInput(event)
        }
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
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
            console.log("user id "+key)
        }
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

    nextPage(pageName) {
        this.loading(true)
        this.props.navigation.navigate(pageName)
        this.loading(false)
    }

    render() {
        return (
            <div className='wrapper'>
                <Header history={this.props.history} />
                <div className='row'>
                    <div className='rowFirst'>
                        <h2>::session page::</h2>
                    </div>
                </div>
                <div className='row'>
                    <table>

                    </table>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlaySession);

