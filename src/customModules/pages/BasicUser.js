import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    TextInput,
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableNativeFeedback,
    ScrollView
} from 'react-native';
import Header from './Header.js'
import { bindActionCreators } from 'redux';
import validator from 'validator';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class BasicUser extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this);
        this.signIn = this.signIn.bind(this);
    }

    state = {
        validatorMsg: '',
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

    updateInput(data) {
        this.props.actions(data)
        this.validateInput(data, false)
    }

    clickNext() {
        this.loading(true)
        let user = this.props.user;
        if (this.validateInput(user)) {
            if (user.username == user.authToken.username) {
                let data = {
                    'signIn': {
                        'userName': user.authToken.username,
                        'token': user.authToken.token,
                        'createdDate': user.authToken.createdDate
                    }
                }
                this.nextPage(data);
            } else {
                DatabaseAPI.createNewUser(user, this.signIn)
            }
        } else {
            this.loading(false)
        }
    }

    signIn(data, error) {
        if (data && data.createNewUser) {
            let user = data.createNewUser;
            let userIdValue = user.userId
            this.updateInput({ "userId": userIdValue })
            let username = this.props.user.username;
            let password = this.props.user.password;
            DatabaseAPI.signIn(username, password, this.nextPage)
        } else {
            this.loading(false)
            Alert.alert('::error::', '\nUser already exists, Looks like someone beat you to it :(')
        }
    }

    nextPage(data, error) {
        if (data && data.signIn) {
            let { username, token, createdDate } = data.signIn
            this.updateInput({
                'authToken': {
                    'token': token,
                    'createdDate': createdDate,
                    'username': username
                }
            })
            this.props.navigation.navigate('PersonalUser')
            
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            Alert.alert('::error::', '\nLooks like something went wrong :(')
        }
        this.loading(false)
    }

    validateInput = (data, isAlert = true) => {
        let { firstName, lastName, emailAddress } = data;
        let msg = '';
        let isValid = true;
        if (firstName != undefined && firstName == "") {
            msg = 'first name cannot be empty'
            isValid = false;
        } else if (lastName != undefined && lastName == "") {
            msg = 'last name cannot be empty'
            isValid = false;
        } else if (emailAddress != undefined && !validator.isEmail(emailAddress)) {
            msg = 'email address is not a valid'
            isValid = false;
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !isValid) {
            Alert.alert('::error::', msg)
        }
        return isValid;
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
                            <Text style={style.h1}>::basic info::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>first name:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(firstName) =>
                                this.updateInput({ "firstName": firstName })} value={this.props.user.firstName} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>last name:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(lastName) =>
                                this.updateInput({ "lastName": lastName })} value={this.props.user.lastName} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>email address:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(emailAddress) =>
                                this.updateInput({ "emailAddress": emailAddress.trim()})} value={this.props.user.emailAddress} />
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>create account</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(BasicUser);