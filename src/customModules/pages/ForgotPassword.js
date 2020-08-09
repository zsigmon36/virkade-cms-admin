import React, { Component } from 'react';
import { connect } from 'react-redux';
import { defaultState } from '../../static/reduxDefault'
import { bindActionCreators } from 'redux';
import userAction from '../reduxActions/UserAction';
import sharedFlagsAction from '../reduxActions/SharedFlagsAction.js'
import alertAction from '../reduxActions/AlertAction.js';
import { DatabaseAPI } from '../dataAccess/DatabaseAPI.js'
import Header from './fragments/Header'
import { ROUTES } from '../VirkadeAdminPages';

class BasicAccount extends Component {

    constructor(props) {
        super(props)
        this.setSecurityQ = this.setSecurityQ.bind(this)
        this.checkSecurityA = this.checkSecurityA.bind(this)
        this.nextPage = this.nextPage.bind(this)
    }

    state = {
        validatorMsg: '',
        step: 1,
        isSecurityPw: true,
        pwToggleMsg: "[show]",
        isSecuritySa: true,
        saToggleMsg: "[show]",
        loading: true,
    }

    componentDidMount() {
        this.setState({ loading: false })
    }
    loading(data) {
        let loading = data || false;
        this.props.sharedFlagsAction({ loading: loading })
        return true
    }

    toggleShowPw() {
        if (this.state.isSecurityPw) {
            this.setState({ isSecurityPw: false })
            this.setState({ pwToggleMsg: "[hide]" })
        } else {
            this.setState({ isSecurityPw: true })
            this.setState({ pwToggleMsg: "[show]" })
        }
    }
    toggleShowSa() {
        if (this.state.isSecuritySa) {
            this.setState({ isSecuritySa: false })
            this.setState({ saToggleMsg: "[hide]" })
        } else {
            this.setState({ isSecuritySa: true })
            this.setState({ saToggleMsg: "[show]" })
        }
    }

    updateInput = (data) => {
        this.props.userActions(data)
        this.validateInput(data, false)
    }

    setSecurityQ(data, error) {
        if (data && data.getUserByUsername) {
            this.updateInput({ "securityQuestion": data.getUserByUsername.securityQuestion })
            this.setState({ step: 2 });
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.  \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like we can't find that user.` })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        this.loading(false)
    }
    checkSecurityA(data, error) {
        if (data && data.recoverySignIn) {
            this.setState({ step: 3 });
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `check your email... \nwe have sent you a security passcode you will need to update your password.` })
            this.props.sharedFlagsAction({ alertOpen: true });
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.  \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like we could not verify your credentials.` })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        this.loading(false)
    }
    nextPage(data, error) {
        if (data && data.setNewPassword) {
            this.props.userActions({ resetDefaults: defaultState })
            this.props.alertAction({ type: 'info' })
            this.props.alertAction({ msg: 'password update successful' })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.props.history.push(ROUTES.HOME_PAGE);
        } else if (error) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like something went wrong.  \n${error[0].message}` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.setState({ step: 1 });
        } else {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: `hmmm... \nlooks like we could not set your new password.` })
            this.props.sharedFlagsAction({ alertOpen: true });
            this.setState({ step: 1 });
        }
        this.loading(false)
    }
    validateInput(data, isAlert = true) {
        let { username, password, securityAnswer } = data;
        let msg = '';
        let valid = true
        if (username !== undefined && (username === "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password !== undefined && (password === "" || password.length < 8)) {
            msg = 'password is too short'
            valid = false;
        } else if (securityAnswer !== undefined && securityAnswer === "") {
            msg = 'security answer cannot be empty'
            valid = false;
        } else if (this.props.user.authToken.username === username) {
            msg = `you are logged in as ${username} \nno need to recover the password`
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !valid) {
            this.props.alertAction({ type: 'error' })
            this.props.alertAction({ msg: msg })
            this.props.sharedFlagsAction({ alertOpen: true });
        }
        return valid;

    }

    render() {
        return (
            <div className="wrapper">
                <Header history={this.props.history} />
                <div className="body">
                    <div className="main">
                        <h2>
                            <p className="label">{this.state.validatorMsg}</p>
                        </h2>
                        <div className="row">
                            <h1>::recover account::</h1>
                        </div>
                        {this.state.step === 1 &&
                            <div className="row">
                                <p className="label">username:</p>
                                <input className="input" onChangetext={(username) =>
                                    this.updateInput({ username: username })} value={this.props.user.username} />
                            </div>
                        }
                        {this.state.step === 2 &&
                            <div className="row">
                                <p className="label">security q: {this.props.user.securityQuestion}</p>
                            </div>
                        }
                        {this.state.step === 2 &&
                            <div className="row">
                                <p className="label">security a:</p>
                                <input className="input" type={this.state.isSecuritySa? "password" : "text"} onChangetext={(securityAnswer) =>
                                    this.updateInput({ securityAnswer: securityAnswer })} value={this.props.user.securityAnswer} />
                                <button onClick={() => this.toggleShowSa()}>
                                    {this.state.saToggleMsg}
                                </button>
                            </div>
                        }
                        {this.state.step === 3 &&
                            <div className="row">
                                <p className="label">new password:</p>
                                <input className="input" type={this.state.isSecurityPw? "password" : "text"} onChangetext={(password) =>
                                    this.updateInput({ password: password })} value={this.props.user.password} />
                                <button onClick={() => this.toggleShowPw()}>
                                    {this.state.pwToggleMsg}
                                </button>
                            </div>
                        }
                        {this.state.step === 3 &&
                            <div className="row">
                                <p className="label">passcode:</p>
                                <input className="input" onChangetext={(passcode) =>
                                    this.updateInput({ passcode: passcode })} value={this.props.user.passcode} />
                            </div>
                        }
                        {this.state.step === 1 &&
                            <div className="row">
                                <button onClick={() => this.validateInput({ username: this.props.user.username }) && this.loading(true) && DatabaseAPI.getSecurityQ(this.props.user.username, this.setSecurityQ)}>
                                    <div className="next">
                                        <p className="label">get security question</p>
                                    </div>
                                </button>
                            </div>
                        }
                        {this.state.step === 2 &&
                            <div className="row">
                                <button onClick={() => this.validateInput({ securityAnswer: this.props.user.securityAnswer }) && this.loading(true) && DatabaseAPI.checkSecurityA(this.props.user, this.checkSecurityA)}>
                                    submit security answer
                                </button>
                            </div>
                        }
                        {this.state.step === 3 &&
                            <div className="row">
                                <button onClick={() => this.validateInput({ password: this.props.user.password }) && this.loading(true) && DatabaseAPI.setNewPassword(this.props.user, this.nextPage)}>
                                    change password
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userAction, dispatch),
        sharedFlagsAction: bindActionCreators(sharedFlagsAction, dispatch),
        alertAction: bindActionCreators(alertAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicAccount);