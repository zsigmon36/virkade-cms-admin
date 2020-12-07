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
        this.updateInput = this.updateInput.bind(this)
    }

    state = {
        validatorMsg: '',
        step: 1,
        isSecurityPw: true,
        pwToggleMsg: "[show]",
        isSecuritySa: true,
        saToggleMsg: "[show]",
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

    updateInput(event) {
        let key = event.target.name
        let value = event.target.value
        this.props.userActions({ [key]: value })
        this.validateInput({ [key]: value }, false)
    }

    setSecurityQ(data, error) {
        if (data && data.getUserByUsername) {
            let event = { target: { name: "securityQuestion", value: [data.getUserByUsername.securityQuestion] } }
            this.updateInput(event)
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
            msg = 'username must be more than 6 characters'
            valid = false;
        } else if (password !== undefined && (password === "" || password.length < 8)) {
            msg = 'password must be more than 8 characters'
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
                <Header history={this.props.history} curModule={this} />
                <div className='section'>
                    <div className='row even-space'>
                        <h4>{this.state.validatorMsg}</h4>
                    </div>
                    <div className="row">
                        <div className='col border' style={{ flexGrow: 0.2, padding: '0 10px 0 10px', margin: '0 10px 0 10px' }}>
                            <h2>::recover account::</h2>
                            <div className='separator'></div>

                            {this.state.step === 1 &&
                                <div className="row even-space" style={{ width: '80%' }}>
                                    <label htmlFor="username" >username:</label>
                                    <input id="username" name="username" className="input" onChange={this.updateInput} value={this.props.user.username} />
                                </div>
                            }
                            {this.state.step === 2 &&
                                <div className="row even-space" style={{ width: '80%' }}>
                                    <label htmlFor="securityQuestion" >security q:</label>
                                    <input id="security-question" name="securityQuestion" className="input" onChange={this.updateInput} value={this.props.user.securityQuestion} readOnly />
                                </div>
                            }
                            {this.state.step === 2 &&
                                <div className="row even-space" style={{ width: '80%' }}>
                                    <label htmlFor="securityAnswer" >security a:</label>
                                    <input id="security-answer" name="securityAnswer" className="input" type={this.state.isSecuritySa ? "password" : "text"} onChange={this.updateInput} value={this.props.user.securityAnswer} />
                                    <button className="hyperlink" type="button" onClick={() => this.toggleShowSa()}>
                                        {this.state.saToggleMsg}
                                    </button>
                                </div>
                            }
                            {this.state.step === 3 &&
                                <div className="row even-space" style={{ width: '80%' }}>
                                    <label htmlFor="password" >new password:</label>
                                    <input id="password" name="password" className="input" type={this.state.isSecurityPw ? "password" : "text"} onChange={this.updateInput} value={this.props.user.password} />
                                    <button className="hyperlink" type="button" onClick={() => this.toggleShowPw()}>
                                        {this.state.pwToggleMsg}
                                    </button>
                                </div>
                            }
                            {this.state.step === 3 &&
                                <div className="row" style={{ width: '80%' }}>
                                    <label htmlFor="passcode" >passcode:</label>
                                    <input id="passcode" name="passcode" className="input" onChange={this.updateInput} value={this.props.user.passcode} />
                                </div>
                            }
                            {this.state.step === 1 &&
                                <div className="row" style={{ width: '80%' }}>
                                    <button style={{ 'flexGrow': 1 }} onClick={() => this.validateInput({ username: this.props.user.username }) && this.loading(true) && DatabaseAPI.getSecurityQ(this.props.user.username, this.setSecurityQ)}>
                                        get security question
                                    </button>
                                </div>
                            }
                            {this.state.step === 2 &&
                                <div className="row" style={{ width: '80%' }}>
                                    <button style={{ 'flexGrow': 1 }} onClick={() => this.validateInput({ securityAnswer: this.props.user.securityAnswer }) && this.loading(true) && DatabaseAPI.checkSecurityA(this.props.user, this.checkSecurityA)}>
                                        submit security answer
                                </button>
                                </div>
                            }
                            {this.state.step === 3 &&
                                <div className="row" style={{ width: '80%' }}>
                                    <button style={{ 'flexGrow': 1 }} onClick={() => this.validateInput({ password: this.props.user.password }) && this.loading(true) && DatabaseAPI.setNewPassword(this.props.user, this.nextPage)}>
                                        change password
                                </button>
                                </div>
                            }
                        </div>
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