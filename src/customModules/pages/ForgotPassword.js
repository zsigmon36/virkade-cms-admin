import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    TextInput,
    Text,
    View,
    Alert,
    ScrollView,
    TouchableNativeFeedback
} from 'react-native';
import Header from './Header.js'
import { defaultState } from '../static/reduxDefault'
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction';
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

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
        this.setState({ loading: loading })
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
        this.props.actions(data)
        this.validateInput(data, false)
    }

    setSecurityQ(data, error) {
        if (data && data.getUserByUsername) {
            this.updateInput({ "securityQuestion": data.getUserByUsername.securityQuestion })
            this.setState({ step: 2 });
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            Alert.alert('::info::', `\nhmmm... \nlooks like we can't find that user.`)
        }
        this.loading(false)
    }
    checkSecurityA(data, error) {
        if (data && data.recoverySignIn) {
            this.setState({ step: 3 });
            Alert.alert('::info::', `\ncheck your email... \nwe have sent you a security passcode you will need to update your password.`)
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            Alert.alert('::info::', `\nhmmm... \nlooks like we could not verify your credentials.`)
        }
        this.loading(false)
    }
    nextPage(data, error) {
        if (data && data.setNewPassword) {
            this.props.actions({ resetDefaults: defaultState })
            Alert.alert('::info::', '\npassword update successful',
                [
                    {
                        text: "ok",
                        onPress: this.props.navigation.navigate('Splash'),
                        style: 'default'
                    }
                ],
                { cancelable: false }
            );
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
            this.setState({ step: 1 });
        } else {
            Alert.alert('::error::', `\nhmmm... \nlooks like we could not set your new password.`)
            this.setState({ step: 1 });
        }
        this.loading(false)
    }
    validateInput(data, isAlert = true) {
        let { username, password, securityAnswer } = data;
        let msg = '';
        valid = true
        if (username != undefined && (username == "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password != undefined && (password == "" || password.length < 8)) {
            msg = 'password is too short'
            valid = false;
        } else if (securityAnswer != undefined && securityAnswer == "") {
            msg = 'security answer cannot be empty'
            valid = false;
        } else if (this.props.user.authToken.username === username) {
            msg = `you are logged in as ${username} \nno need to recover the password`
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !valid) {
            Alert.alert('::error::', msg)
        }
        return valid;

    }

    render() {
        return (
            <ScrollView keyboardDismissMode='on-drag' style={style.wrapper}>
                <Loader loading={this.state.loading} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.h2}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::recover account::</Text>
                        </View>
                        {this.state.step == 1 &&
                            <View style={style.col}>
                                <Text style={style.label}>username:</Text>
                                <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(username) =>
                                    this.updateInput({ username: username })} value={this.props.user.username} />
                            </View>
                        }
                        {this.state.step == 2 &&
                            <View style={style.col}>
                                <Text style={style.label} underlineColorAndroid="#9fff80">security q: {this.props.user.securityQuestion}</Text>
                            </View>
                        }
                        {this.state.step == 2 &&
                            <View style={style.col}>
                                <Text style={style.label}>security a:</Text>
                                <TextInput style={style.input} secureTextEntry={this.state.isSecuritySa} underlineColorAndroid="#9fff80" onChangeText={(securityAnswer) =>
                                    this.updateInput({ securityAnswer: securityAnswer })} value={this.props.user.securityAnswer} />
                                <TouchableNativeFeedback onPress={() => this.toggleShowSa()}>
                                    <Text style={style.label}>{this.state.saToggleMsg}</Text>
                                </TouchableNativeFeedback>
                            </View>
                        }
                        {this.state.step == 3 &&
                            <View style={style.col}>
                                <Text style={style.label}>new password:</Text>
                                <TextInput style={style.input} secureTextEntry={this.state.isSecurityPw} underlineColorAndroid="#9fff80" onChangeText={(password) =>
                                    this.updateInput({ password: password })} value={this.props.user.password} />
                                <TouchableNativeFeedback onPress={() => this.toggleShowPw()}>
                                    <Text style={style.label}>{this.state.pwToggleMsg}</Text>
                                </TouchableNativeFeedback>
                            </View>
                        }
                        {this.state.step == 3 &&
                            <View style={style.col}>
                                <Text style={style.label}>passcode:</Text>
                                <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(passcode) =>
                                    this.updateInput({ passcode: passcode })} value={this.props.user.passcode} />
                            </View>
                        }
                        {this.state.step == 1 &&
                            <View style={style.col}>
                                <TouchableNativeFeedback onPress={() => this.validateInput({ username: this.props.user.username }) && this.loading(true) && DatabaseAPI.getSecurityQ(this.props.user.username, this.setSecurityQ)}>
                                    <View style={style.next}>
                                        <Text style={style.label}>get security question</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        }
                        {this.state.step == 2 &&
                            <View style={style.col}>
                                <TouchableNativeFeedback onPress={() => this.validateInput({ securityAnswer: this.props.user.securityAnswer }) && this.loading(true) && DatabaseAPI.checkSecurityA(this.props.user, this.checkSecurityA)}>
                                    <View style={style.next}>
                                        <Text style={style.label}>submit security answer</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        }
                        {this.state.step == 3 &&
                            <View style={style.col}>
                                <TouchableNativeFeedback onPress={() => this.validateInput({ password: this.props.user.password }) && this.loading(true) && DatabaseAPI.setNewPassword(this.props.user, this.nextPage)}>
                                    <View style={style.next}>
                                        <Text style={style.label}>change password</Text>
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        }
                    </View>
                    <View style={style.spacer}></View>
                </View>
            </ScrollView>
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
        actions: bindActionCreators(userAction, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BasicAccount);