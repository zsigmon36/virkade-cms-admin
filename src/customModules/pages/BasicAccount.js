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
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction';
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class BasicAccount extends Component {

    constructor(props) {
        super(props)
        this.clickNext = this.clickNext.bind(this)
        this.nextPage = this.nextPage.bind(this)
    }

    state = {
        validatorMsg: '',
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

    clickNext() {
        this.loading(true)
        let { username, authToken } = this.props.user;
        let isValid = this.validateInput(this.props.user)
        if (isValid && username != authToken.username) {
            DatabaseAPI.getUserByUserName(this.props.user, this.nextPage)
        } else if (isValid) {
            this.props.navigation.navigate('BasicUser')
            this.loading(false)
        } else {
            this.loading(false)
        }
    }
    nextPage(data, error) {
        if (data && data.getUserByUsername) {
            this.loading(false)
            Alert.alert('::error::', '\nusername already exists, looks like someone beat you to it :(')
        } else if (error) {
            this.loading(false)
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            this.props.navigation.navigate('BasicUser')
            this.loading(false)
        }
    }

    validateInput(data, isAlert = true) {
        let { username, password, securityQuestion, securityAnswer } = data;
        let msg = '';
        valid = true
        if (username != undefined && (username == "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password != undefined && (password == "" || password.length < 8)) {
            msg = 'password is too short'
            valid = false;
        } else if (securityQuestion != undefined && securityQuestion == "") {
            msg = 'security question cannot be empty'
            valid = false;
        } else if (securityAnswer != undefined && securityAnswer == "") {
            msg = 'security answer cannot be empty'
            valid = false;
        } else if (this.props.user.authToken.username === username) {
            msg = `you are logged in as ${username} \nchange username if you want to create a new account`
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
                            <Text style={style.h1}>::create account::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>username:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(username) =>
                                this.updateInput({ username: username.trim() })} value={this.props.user.username} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>password:</Text>
                            <TextInput style={style.input} secureTextEntry={this.state.isSecurityPw} underlineColorAndroid="#9fff80" onChangeText={(password) =>
                                this.updateInput({ password: password.trim() })} value={this.props.user.password} />
                            <TouchableNativeFeedback onPress={() => this.toggleShowPw()}>
                                <Text style={style.label}>{this.state.pwToggleMsg}</Text>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>security q:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(securityQuestion) =>
                                this.updateInput({ securityQuestion: securityQuestion })} value={this.props.user.securityQuestion} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>security a:</Text>
                            <TextInput style={style.input} secureTextEntry={this.state.isSecuritySa} underlineColorAndroid="#9fff80" onChangeText={(securityAnswer) =>
                                this.updateInput({ securityAnswer: securityAnswer})} value={this.props.user.securityAnswer} />
                            <TouchableNativeFeedback onPress={() => this.toggleShowSa()}>
                                <Text style={style.label}>{this.state.saToggleMsg}</Text>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>next</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
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