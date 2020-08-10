import React, { Component } from 'react';
import { DatabaseAPI } from '../../dataAccess/DatabaseAPI.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from '../../reduxActions/UserAction.js';
import sharedFlagsAction from '../../reduxActions/SharedFlagsAction.js'
import alertAction from '../../reduxActions/AlertAction.js';
import { ROUTES } from '../../VirkadeAdminPages';

class Login extends Component {
    constructor(props) {
        super(props)
        this.signInCallBack = this.signInCallBack.bind(this)
        this.populateStore = this.populateStore.bind(this)
        this.updateInput = this.updateInput.bind(this)
    }

    state = {
        isSecurity: true,
        pwToggleMsg: "[show]",
        validatorMsg: '',
    }

    componentDidMount() {
        this.loading(false)
    }

    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    toggleShowPw() {
        if (this.state.isSecurity) {
            this.setState({ isSecurity: false })
            this.setState({ pwToggleMsg: "[hide]" })
        } else {
            this.setState({ isSecurity: true })
            this.setState({ pwToggleMsg: "[show]" })
        }
    }

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        this.props.userAction({ [key]: value })
        this.validateInput({ [key]: value }, false)
    }

    clickNext() {
        let { username, password } = this.props.user;
        let isValid = this.validateInput(this.props.user)
        if (isValid) {
            this.loading(true)
            DatabaseAPI.signIn(username, password, this.signInCallBack)
        }
    }

    validateInput(data, isAlert = true) {
        let { username, password } = data;
        let msg = '';
        let valid = true
        if (username !== undefined && (username === "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password !== undefined && (password === "" || password.length < 8)) {
            msg = 'password is too short'
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

    signInCallBack(data) {
        if (data && data.signIn) {
            let { username, token, createdDate } = data.signIn
            let target = {
                name: "authToken", value: {
                    'token': token,
                    'createdDate': createdDate,
                    'username': username
                }
            }
            this.updateInput({ target })
            DatabaseAPI.getAllFieldsUserByUserName(this.props.user, this.populateStore)
        } else {
            this.loading(false)
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `login failed, make sure you provided the correct credentials or select forgot password` })
            this.props.sharedFlagsAction({ alertOpen: true });

        }
    }

    populateStore(data, error) {
        if (data && data.getUserByUsername) {
            let userDetails = data.getUserByUsername
            let target = {name: 'fullUser', value: userDetails}
            this.updateInput({ target })
            this.props.sharedFlagsAction({showLogin: false})
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `Looks like something went wrong :( \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        this.loading(false)
    }

    render() {
        return (
            <div>
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="main">
                            <button className="close-icon" onClick={() => this.props.sharedFlagsAction({ showLogin: false })}>X</button>
                            <div className="row" style={{ alignSelf: "center" }}>
                                <h1 style={{ margin: "5px" }}>::sign in::</h1>
                            </div>
                            <div className="row" style={{ alignSelf: "center" }}>
                                <h3>{this.state.validatorMsg}</h3>
                            </div>
                            <div className="row">
                                <p className="label">username:</p>
                                <input className="input" type="text" name="username"
                                    onChange={this.updateInput} value={this.props.user.username} />
                            </div>
                            <div className="row">
                                <p className="label">password:</p>
                                <input className="input" name="password" type={this.state.isSecurity ? "password" : "text"}
                                    onChange={this.updateInput} value={this.props.user.password} />
                                <button className="hyperlink" onClick={() => this.toggleShowPw()}>
                                    {this.state.pwToggleMsg}
                                </button>
                            </div>
                            <div className='row'>
                                <button onClick={() => this.clickNext()} >
                                    sign in
                            </button>
                            </div>
                            <div className='row' style={{ alignSelf: "flex-end" }}>
                                <button className="hyperlink" style={{ flexGrow: 1 }} onClick={() =>
                                    this.props.sharedFlagsAction({ showLogin: false })
                                    && this.props.history.push(ROUTES.FORGOTPASS_PAGE)} >
                                    forgot password
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userAction: bindActionCreators(userAction, dispatch),
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
        alertAction: bindActionCreators(alertAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);