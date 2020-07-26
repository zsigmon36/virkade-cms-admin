import React, { Component } from 'react';
import {
    TextInput,
    Text,
    View,
    Alert,
    TouchableNativeFeedback,
    ScrollView
} from 'react-native';
import Header from './Header.js'
import UserDock from './UserDock.js'
import validator from 'validator';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import { Picker } from '@react-native-community/picker';
import { pickerData } from '../static/pickerData';
import style from '../static/styles.js'
import Loader from './Loader.js';

class EditAccount extends Component {

    constructor(props) {
        super(props)
        this.statusMessage = this.statusMessage.bind(this);
        this.setPickerSates = this.setPickerSates.bind(this);
        this.addPhoneNumber = this.addPhoneNumber.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.statusMessage = this.statusMessage.bind(this);
        this.validateUsername = this.validateUsername.bind(this);
        this.getUser = this.getUser.bind(this);
        this.commentResp = this.commentResp.bind(this);
        
        DatabaseAPI.getAllStates(this.props.user, this.setPickerSates)
    }
    state = {
        validatorMsg: '',
        pickerStates: <Picker.Item key="1" label="Arkansas" value="AR" />,
        user: Object.assign({}, this.props.user),
        canContactLcl: this.props.user.canContact?'[X]':'[ ]',
        reServicesLcl: this.props.user.reServices?'[X]':'[ ]',
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

    contactCheckBox = () => {
        if (this.state.canContactLcl == '[ ]') {
            this.updateInput({'canContact': true})
            this.setState({ 'canContactLcl': '[X]' })
        } else {
            this.updateInput({'canContact': false})
            this.setState({ 'canContactLcl': '[ ]' })
        }
    }
    reCheckBox = () => {
        if (this.state.reServicesLcl == '[ ]') {
            this.updateInput({'reServices': true})
            this.setState({ 'reServicesLcl': '[X]' })
        } else {
            this.updateInput({'reServices': false})
            this.setState({ 'reServicesLcl': '[ ]' })
        }
    }

    updateInput(data) {
        let user = this.state.user
        let key = Object.keys(data)[0]
        user[key] = data[key]
        this.setState(user)
        this.validateInput(data, false)
    }

    setPickerSates(data) {
        let pickerItems = [];
        if (data.getAllStates) {
            (data.getAllStates).map(item => {
                pickerItems.push(<Picker.Item key={item.name} label={item.name} value={item.stateCode} />)
            })
        }
        this.setState({ 'pickerStates': pickerItems })
    }
    comment() {
        this.loading(true)
        let user = this.state.user
        if (user.commentContent && user.commentContent != '') {
            DatabaseAPI.addUserComment(user, this.commentResp)
        } else {
            Alert.alert("::error::", "\ncomment cannot be empty")
            this.loading(false)
        }
    }

    commentResp(data, error) {
        if (data && data.addComment){
            Alert.alert("::info::", "\nthanks, comment added")
        } else if (error){
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong. \n${error[0].messages}`)
        } else {
            Alert.alert("::error::", "\nhmmm... \nlooks like something went wrong. ")
        }
        this.loading(false)
    }

    getUser() {
        this.loading(true)
        let { username, authToken } = this.state.user;
        let isValid = this.validateInput(this.state.user)
        if (isValid && username != authToken.username) {
            DatabaseAPI.getUserByUserName(this.state.user.username, this.validateUsername);
        } else if (isValid) {
            this.validateUsername(null)
        } else {
            this.loading(false)
        }

    }

    validateUsername(data, error) {
        let user = this.state.user;
        if (data && data.getUserByUserName) {
            this.loading(false)
            Alert.alert('::error::', '\nusername already exists, looks like someone beat you to it :(')
        } else if (user.street || user.postalCode || user.state || user.city) {
            DatabaseAPI.addUserAddress(user, this.addPhoneNumber)
        } else {
            this.addPhoneNumber();
        }
    }

    addPhoneNumber() {
        let user = this.state.user
        if (user.phoneNumber) {
            this.validateInput(user) && DatabaseAPI.addUserPhone(user, this.updateUser)
        } else {
            this.updateUser();
        }
    }

    updateUser() {
        let user = this.state.user
        DatabaseAPI.updateUser(user, this.statusMessage)
    }

    statusMessage(data, error) {
        if (data && data.updateUser) {
            this.props.actions({ fullUser: this.state.user })
            Alert.alert("::info::", "update complete")
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong. \n${error[0].messages}`)
        } else {

        }
        this.loading(false)
    }

    validateInput(data, isAlert = true) {
        let { postalCode, age, weight, phoneNumber, firstName, lastName, emailAddress } = data;
        let msg = '';
        let isValid = true;
        if (postalCode != undefined && postalCode != '' && !validator.isPostalCode(postalCode, "US")) {
            msg = 'postal code is not valid'
            isValid = false;
        } else if (age != undefined && age != '' && (!validator.isNumeric(String(age)) || age.length > 3)) {
            msg = 'age has to be a number and less than 999'
            isValid = false;
        } else if (weight != undefined && weight != '' && (!validator.isNumeric(String(weight)) || weight.length > 3)) {
            msg = 'weight has to be a number and less than 999'
            isValid = false;
        } else if (phoneNumber != undefined && phoneNumber != '' && !validator.isMobilePhone(phoneNumber, 'any')) {
            msg = 'mobile phone number is invalid'
            isValid = false;
        } else if (firstName != undefined && firstName == "") {
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
                <Loader loading={this.state.loading} />
                <UserDock navigator={this.props.navigation} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.center}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::account details::</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h2}>::personal info::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>first name:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(firstName) =>
                                this.updateInput({ "firstName": firstName })} value={this.state.user.firstName} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>last name:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(lastName) =>
                                this.updateInput({ "lastName": lastName })} value={this.state.user.lastName} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>email address:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(emailAddress) =>
                                this.updateInput({ "emailAddress": emailAddress.trim() })} value={this.state.user.emailAddress} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>gender you identify:</Text>
                            <Picker
                                selectedValue={this.state.user.gender}
                                style={style.picker}
                                itemStyle={style.pickerItem}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "gender": itemValue })
                                }>
                                <Picker.Item label="select" value="" />
                                <Picker.Item label="male" value="m" />
                                <Picker.Item label="female" value="f" />
                            </Picker>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>age:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(age) =>
                                this.updateInput({ 'age': age.trim() })} value={String(this.state.user.age)} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>height:</Text>
                            <Picker
                                selectedValue={this.state.user.heightFt}
                                style={style.input}
                                itemStyle={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "heightFt": itemValue })
                                }>
                                <Picker.Item label="sel foot" value="0" />
                                {
                                    (pickerData.heightFt).map((item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                            <Picker
                                selectedValue={this.state.user.heightIn}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "heightIn": itemValue })
                                }>
                                <Picker.Item label="sel inch" value="0" />
                                {
                                    (pickerData.heightIn).map((item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>weight:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(weight) =>
                                this.updateInput({ 'weight': weight.trim() })} value={String(this.state.user.weight)} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>eye space:</Text>
                            <Picker
                                selectedValue={String(this.state.user.idp)}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "idp": itemValue })
                                }>
                                <Picker.Item label="select" value="0.0" />
                                {
                                    (pickerData.idp).map((item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                        </View>
                        <View style={[style.col, style.center]}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={[style.col, style.center]}>
                            <Text style={[style.label, style.h2]}>::physical address::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>street:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(street) =>
                                this.updateInput({ 'street': street })} value={this.state.user.street} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>apt:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(apt) =>
                                this.updateInput({ 'apt': apt })} value={this.state.user.apt} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>unit:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(unit) =>
                                this.updateInput({ 'unit': unit })} value={this.state.user.unit} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>city:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(city) =>
                                this.updateInput({ 'city': city })} value={this.state.user.city} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>state:</Text>
                            <Picker
                                selectedValue={this.state.user.state}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "state": itemValue })
                                }>
                                <Picker.Item label="select" value="" />
                                {this.state.pickerStates}
                            </Picker>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>postal code:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(postalCode) =>
                                this.updateInput({ 'postalCode': postalCode })} value={this.state.user.postalCode} />
                        </View>
                        <View style={[style.col, style.center]}>
                            <Text style={style.label}>{this.state.validatorMsg}</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h2}>::mobile phone number::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>cc:</Text>
                            <Picker
                                selectedValue={this.state.user.phoneCountryCode}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "phoneCountryCode": itemValue })
                                }>
                                <Picker.Item label="select" value='0' />
                                {
                                    (pickerData.phoneCountries).map((item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                            <Text style={style.label}>number:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(phoneNumber) =>
                                this.updateInput({ 'phoneNumber': phoneNumber })} value={this.state.user.phoneNumber} />
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::contact preference::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.checkBox} onPress={this.reCheckBox}> {this.state.reServicesLcl} interested in VR real estate services?</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.checkBox} onPress={this.contactCheckBox}> {this.state.canContactLcl} can we contact you? </Text>
                        </View>
                        <View style={style.col}></View>
                        <View>
                            <Text style={style.h2}>:note any conditions:</Text>
                        </View>
                        <View>
                            <Text style={style.h2}>:we should be aware:</Text>
                        </View>
                        <View style={style.col}>
                            <TextInput multiline={true} style={[style.input, style.textArea]} underlineColorAndroid='transparent' onChangeText={(commentContent) =>
                                this.updateInput({ 'commentContent': commentContent })} />
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.comment()}>
                                <View style={style.next}>
                                    <Text style={style.label}>add comment</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.getUser()}>
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

export default connect(mapStateToProps, mapDispatchToProps)(EditAccount);