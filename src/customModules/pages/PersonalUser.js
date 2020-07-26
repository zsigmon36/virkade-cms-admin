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
import validator from 'validator';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import { Picker } from '@react-native-community/picker';
import { pickerData } from '../static/pickerData';
import Loader from './Loader.js';
import style from '../static/styles.js'

class PersonalUser extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this);
        this.setPickerSates = this.setPickerSates.bind(this);
        this.addPhoneNumber = this.addPhoneNumber.bind(this);
        DatabaseAPI.getAllStates(this.props.user, this.setPickerSates)
    }

    state = {
        validatorMsg: '',
        pickerStates: <Picker.Item key="1" label="Arkansas" value="AR" />,
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

    setPickerSates(data){
        let pickerItems = [];
        if (data.getAllStates){
            (data.getAllStates).map(item => {
                pickerItems.push(<Picker.Item key={item.name} label={item.name} value={item.stateCode} />)
            })
        }
        this.setState({'pickerStates': pickerItems})
    }

    clickNext() {
        this.loading(true)
        let user = this.props.user
        let isValid = this.validateInput(user)
        if ((user.street || user.postalCode || user.state || user.city) && isValid) {
            DatabaseAPI.addUserAddress(user, this.addPhoneNumber)
        } else if (isValid){
            this.addPhoneNumber();
        } else {
            this.loading(false)
        }
    }

    addPhoneNumber(){
        let user = this.props.user
        if (user.phoneNumber) {
            DatabaseAPI.addUserPhone(user, this.nextPage)
        } else {
            this.nextPage();
        }
    }

    nextPage() {
        this.props.navigation.navigate('FinalDetails')
        this.loading(false)
    }

    validateInput(data, isAlert = true) {
        let {postalCode, age, weight, phoneNumber} = data;
        let msg = '';
        let isValid = true;
        //let matches = zip.match(/^[0-9]{5}(?:-[0-9]{4})?$/g);
        if (postalCode != undefined && postalCode != '' && !validator.isPostalCode(postalCode,"US") ) {
            msg = 'postal code is not valid'
            isValid = false;
        } else if (age != undefined && age != '' && (!validator.isNumeric(age) || age.length > 3)) {
            msg = 'age has to be a number and less than 999'
            isValid = false;
        } else if (weight != undefined && weight != '' && (!validator.isNumeric(weight) || weight.length > 3)) {
            msg = 'weight has to be a number and less than 999'
            isValid = false;
        } else if (phoneNumber != undefined && phoneNumber != '' && !validator.isMobilePhone(phoneNumber, 'any') ) {
            msg = 'mobile phone number is invalid'
            isValid = false;
        }
        this.setState({ validatorMsg: msg })

        if (isAlert && !isValid) {
            Alert.alert('::error::', msg)
        }
        return isValid;
    }

    render() {
        let user = this.props.user
        return (
            <ScrollView keyboardDismissMode='on-drag' style={style.wrapper}>
                <Loader loading={this.state.loading}/>
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::personal info::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.h3}>:all of the following are optional.  However, we appreciate any personal details as these answers are used 
                            to improve our services and offerings. We do not share the information with any 3rd party partners or organizations:</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>gender you identify:</Text>
                            <Picker
                                selectedValue={user.gender}
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
                        { this.state.validatorMsg !== '' && (
                            <View style={style.center}>
                                    <Text style={style.label}>{this.state.validatorMsg}</Text>
                            </View>
                            )
                        }
                        <View style={style.col}>
                            <Text style={style.label}>age:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(age) =>
                                    this.updateInput({ 'age': age.trim() })} value={String(user.age)} />
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>height:</Text>
                            <Picker
                                selectedValue={user.heightFt}
                                style={style.input}
                                itemStyle={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "heightFt": itemValue })
                                }>        
                                <Picker.Item label="sel foot" value="0" />
                                {
                                    (pickerData.heightFt).map( (item) => {
                                       return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                            <Picker
                                selectedValue={user.heightIn}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "heightIn": itemValue })
                                }>
                                <Picker.Item label="sel inch" value="0" />
                                {
                                     (pickerData.heightIn).map( (item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>weight:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(weight) =>
                                    this.updateInput({ 'weight': weight.trim() })} value={String(user.weight)}/>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>eye space:</Text>
                            <Picker
                                selectedValue={user.idp}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "idp": itemValue })
                                }>
                                <Picker.Item label="select" value="00" />
                                {
                                     (pickerData.idp).map( (item) => {
                                        return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                        </View>
                        <View style={[style.col, style.center]}>
                            <Text style={[style.label, style.h2]}>::physical address::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>street:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(street) =>
                                    this.updateInput({ 'street': street })} value={user.street}/>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>apt:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(apt) =>
                                    this.updateInput({ 'apt': apt })} value={user.apt}/>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>unit:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(unit) =>
                                    this.updateInput({ 'unit': unit })} value={user.unit}/>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>city:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(city) =>
                                    this.updateInput({ 'city': city })} value={user.city}/>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>state:</Text>
                            <Picker
                                selectedValue={user.state}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "state": itemValue })
                                }>
                                <Picker.Item label="select" value="" />
                                {this.state.pickerStates}
                            </Picker>
                        </View>
                        { this.state.validatorMsg !== '' && (
                            <View style={style.center}>
                                    <Text style={style.label}>{this.state.validatorMsg}</Text>
                            </View>
                            )
                        }
                        <View style={style.col}>
                            <Text style={style.label}>postal code:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(postalCode) =>
                                    this.updateInput({ 'postalCode': postalCode })} value={user.postalCode}/>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h2}>::mobile phone number::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.label}>cc:</Text>
                            <Picker
                                selectedValue={user.phoneCountryCode}
                                style={style.input}
                                onValueChange={(itemValue) =>
                                    this.updateInput({ "phoneCountryCode": itemValue })
                                }>
                                <Picker.Item label="select" value='0' />
                                {
                                    (pickerData.phoneCountries).map( (item) => {
                                       return <Picker.Item key={item.value} label={item.label} value={item.value} />
                                    })
                                }
                            </Picker>
                            <Text style={style.label}>number:</Text>
                            <TextInput style={style.input} underlineColorAndroid="#9fff80" onChangeText={(phoneNumber) =>
                                    this.updateInput({ 'phoneNumber': phoneNumber })} value={user.phoneNumber}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(PersonalUser);