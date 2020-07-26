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
import UserDock from './UserDock.js'
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction';
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class EditLogin extends Component {

    constructor(props) {
        super(props)
        this.clickNext = this.clickNext.bind(this)
        this.nextPage = this.nextPage.bind(this)
    }

    state = {
        validatorMsg: '',
        username: this.props.user.username,
        password: this.props.user.password,
        securityA: this.props.user.securityAnswer,
        securityQ: this.props.user.securityQuestion,
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
        let isValid = this.validateInput(this.state)
        if (isValid) {
            let stagedUserData = this.props.user;
            let doUpdate = false
            if (stagedUserData.username !== this.state.username) {
                doUpdate = true
                stagedUserData.username = this.state.username
            }
            if (stagedUserData.password !== (this.state.password).trim()) {
                doUpdate = true
                stagedUserData.password = (this.state.password).trim()
            }
            if (stagedUserData.securityAnswer !== (this.state.securityA).trim()) {
                doUpdate = true
                stagedUserData.securityAnswer = (this.state.securityA).trim()
            }
            if (stagedUserData.securityQuestion !== this.state.securityQ) {
                doUpdate = true
                stagedUserData.securityQuestion = this.state.securityQ
            }
            if (doUpdate) {
                DatabaseAPI.updateUser(stagedUserData, this.nextPage)
            } else {
                this.loading(false);
                Alert.alert('::info::', '\nno changes detected')
            }
        } else {
            this.loading(false)
        }
    }
    nextPage(data, error) {
        if (data && data.updateUser) {
            this.props.actions({ securityQuestion: this.state.securityQ })
            this.props.actions({ username: this.state.username })
            Alert.alert('::info::', '\nlogin info updated')
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            Alert.alert('::info::', `\nhmmm... \nlooks like we could not update your login info.`)
        }
        this.loading(false)
    }

    validateInput(data, isAlert = true) {
        let { username, password, securityQ, securityA } = this.state;
        let msg = '';
        valid = true
        if (username != undefined && (username == "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password != undefined && (password == "" || password.length < 8)) {
            msg = 'password is too short'
            valid = false;
        } else if (securityQ != undefined && securityQ == "") {
            msg = 'security question cannot be empty'
            valid = false;
        } else if (securityA != undefined && securityA == "") {
            msg = 'security answer cannot be empty'
            valid = false;
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
                <UserDock navigator={this.props.navigation} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.h2}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::edit login info::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>username: {this.state.username}</Text>
                            {
                                //<TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(username) =>
                                //  this.setState({ username: username.trim() })} value={this.state.username} />
                            }
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>password:</Text>
                            <TextInput style={style.input} secureTextEntry={this.state.isSecurityPw} underlineColorAndroid="#9fff80" onChangeText={(password) =>
                                this.setState({ password: password.trim()})} value={this.state.password} />
                            <TouchableNativeFeedback onPress={() => this.toggleShowPw()}>
                                <Text style={style.label}>{this.state.pwToggleMsg}</Text>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>security q:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(securityQ) =>
                                this.setState({ securityQ: securityQ })} value={this.state.securityQ} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>security a:</Text>
                            <TextInput style={style.input} secureTextEntry={this.state.isSecuritySa} underlineColorAndroid="#9fff80" onChangeText={(securityA) =>
                                this.setState({ securityA: securityA })} value={this.state.securityA} />
                            <TouchableNativeFeedback onPress={() => this.toggleShowSa()}>
                                <Text style={style.label}>{this.state.saToggleMsg}</Text>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>update</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('Home')}>
                                <View style={style.next}>
                                    <Text style={style.label}>home</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditLogin);