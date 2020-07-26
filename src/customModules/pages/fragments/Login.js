import React, { Component } from 'react';
import {
    Alert,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableNativeFeedback,
} from 'react-native';
import Header from './Header.js'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction';
import Loader from './Loader.js';
import style from '../static/styles.js'

class Login extends Component {
    constructor(props) {
        super(props)
        this.signInCallBack = this.signInCallBack.bind(this)
        this.populateStore = this.populateStore.bind(this)
    }

    state = {
        isSecurity: true,
        pwToggleMsg: "[show]",
        validatorMsg: '',
        loading: true,
    }
    componentDidMount(){
        this.setState({loading: false})
    }
    loading(data){
        let loading = data || false;
        this.setState({loading: loading})
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
    updateInput(data) {
        this.props.userActions(data)
        this.validateInput(data, false)
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
        valid = true
        if (username != undefined && (username == "" || username.length < 6)) {
            msg = 'username is too short'
            valid = false;
        } else if (password != undefined && (password == "" || password.length < 8)) {
            msg = 'password is too short'
            valid = false;
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !valid) {
            Alert.alert('::error::', msg)
        }
        return valid;

    }

    signInCallBack(data) {
        if (data && data.signIn) {
            let { username, token, createdDate } = data.signIn
            this.updateInput({
                'authToken': {
                    'token': token,
                    'createdDate': createdDate,
                    'username': username
                }
            })
            DatabaseAPI.getAllFieldsUserByUserName(this.props.user, this.populateStore)
        } else {
            this.loading(false)
            Alert.alert('::error::', `\nlogin failed, make sure you provided the correct credentials or select forgot password`)

        }
    }

    populateStore(data, error) {
        if (data && data.getUserByUsername) {
            let userDetails = data.getUserByUsername
            this.updateInput({ 'fullUser': userDetails })
            if (!this.props.user.tcAgree){
                this.props.navigation.navigate('TermsConditions');
            }else if (!this.props.user.liableAgree){
                this.props.navigation.navigate('LimitedLiable');
            } else {
                this.props.navigation.navigate('Home');
            }
        } else {
            this.loading(false)
            Alert.alert('::error::', `\nLooks like something went wrong :( \n${error[0].message}`)
        }
        this.loading(false)
    }

    render() {
        return (
            <ScrollView keyboardDismissMode='on-drag' style={style.wrapper}>
                <Loader loading={this.state.loading}/>
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.h2}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::sign in::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>username:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80"
                                onChangeText={(username) =>
                                    this.updateInput({ username: username })} value={this.props.user.username} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>password:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" secureTextEntry={this.state.isSecurity}
                                onChangeText={(password) =>
                                    this.updateInput({ password: password })} value={this.props.user.password} />
                            <TouchableNativeFeedback onPress={() => this.toggleShowPw()}>
                                <Text style={style.label}>{this.state.pwToggleMsg}</Text>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>submit</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.props.navigation.navigate('ForgotPassword')}>
                                <View style={style.forgot}>
                                    <Text style={style.label}>forgot password?</Text>
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

function mapStateToProps(state) {
    return {
        user: state.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userAction, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);