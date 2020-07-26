import React, { Component } from 'react';
import {
    Text,
    View,
    Alert,
    TouchableNativeFeedback,
    ScrollView
} from 'react-native'
import Header from './Header.js'
import UserDock from './UserDock.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import { Picker } from '@react-native-community/picker';
import Loader from './Loader.js';
import style from '../static/styles.js'
import moment from "moment";

class ScheduleSession extends Component {

    constructor(props) {
        super(props)
        this.setSessionOptions = this.setSessionOptions.bind(this)
        this.scheduleResponse = this.scheduleResponse.bind(this)
        this.setPendingSessions = this.setPendingSessions.bind(this)
    }

    state = {
        availableSessionsPicker: <Picker.Item key={-1} label="no sessions available" value={-1} />,
        availableSessions: [],
        pendingSessions: [],
        loading: true,
        selectedSession: 0
    }

    componentDidMount() {
        DatabaseAPI.getAvailableSessions(this.props.user, undefined, undefined, this.setSessionOptions)
        DatabaseAPI.getPendingSessions(this.props.user, undefined, undefined, this.setPendingSessions)
        this.setState({ loading: false })
    }
    loading(data) {
        let loading = data || false;
        this.setState({ loading: loading })
        return true
    }

    setPendingSessions(data) {
        if (data.getPendingSessions) {
            let pendingSessions = [];
            pendingSessions.push(
                <View key={0} style={style.table}>
                    <Text style={[style.th, style.h3]}>start time</Text>
                    <Text style={[style.th, style.h3]}>end time</Text>
                    <Text style={[style.th, style.h3]}>username</Text>  
                </View>
                );
            (data.getPendingSessions).map((session, index) => {
                let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('hh:mm a')
                endDate = endDate.format('hh:mm a')
                let username = session.username

                pendingSessions.push(
                    <View key={index+1} style={[style.table, style.h3]}>
                            <Text style={style.tr}>{startDate}</Text>
                            <Text style={style.tr}>{endDate}</Text>
                            <Text style={style.tr}>{username}</Text>
                    </View>
                    )
            });
            this.setState({ 'pendingSessions': pendingSessions })
        }
        this.loading(false)
    }

    setSessionOptions(data) {
        let pickerItems = [];
        if (data.getAvailableSessions) {
            (data.getAvailableSessions).map((item, index) => {
                let startDate = moment(item.startDate, 'yyyy-MM-DD hh:mm:ss.S')
                let endDate = moment(item.endDate, 'yyyy-MM-DD hh:mm:ss.S')
                startDate = startDate.format('ddd hh:mm a')
                endDate = endDate.format('ddd hh:mm a')
                pickerItems.push(<Picker.Item style={style.pickerItem} key={index} label={`${startDate} - ${endDate}`} value={index} />)
            })
            if ((data.getAvailableSessions).length > 0){
                this.setState({ 'availableSessions': data.getAvailableSessions })
                this.setState({ 'availableSessionsPicker': pickerItems })
            }
        }
        this.loading(false)
    }

    scheduleSession(firstAvail = false) {
        let index = this.state.selectedSession
        if (firstAvail){
            index = 0
        }
        let session = this.state.availableSessions[index]
        if (session && session.startDate && session.endDate) {
            let confMsg = this.getSessionSummary(session)
            Alert.alert("::info::", `\nplease confirm your session details:\n ${confMsg}`,
                [
                    {
                        text:"cancel",
                        style:"cancel"
                    },
                    {
                        text:"ok",
                        onPress: () => {
                            this.loading(true)
                            DatabaseAPI.addUserSession(this.props.user, session, this.scheduleResponse)
                        },
                        style:"default"
                    }
                ]
            );


        } else {
            Alert.alert("::error::", "\nno valid session seletion detected")
            this.loading(false)
        }

    }

    scheduleResponse(data, error) {
        if (data && data.addUserSession && data.addUserSession.sessionId) {
            //set real session id
            Alert.alert("::info::", "session has been scheduled \n\nthank you, please pay at the counter")
            let sessionId = data.addUserSession.sessionId
            this.setState({sessionId})
            DatabaseAPI.getAvailableSessions(this.props.user, undefined, undefined, this.setSessionOptions)
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong. \n${error[0].message}`)
            DatabaseAPI.getAvailableSessions(this.props.user, undefined, undefined, this.setSessionOptions)
        } else {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.`)
            DatabaseAPI.getAvailableSessions(this.props.user, undefined, undefined, this.setSessionOptions)
        }
        
    }

    getSessionSummary(session){
        let startDate = moment(session.startDate, 'yyyy-MM-DD hh:mm:ss.S')
        let endDate = moment(session.endDate, 'yyyy-MM-DD hh:mm:ss.S')
        let startDateFormat = startDate.format('ddd hh:mm a')
        let endDateFormat = endDate.format('ddd hh:mm a')
        let playTime = ((endDate.subtract(startDate))/1000)/60
        let activityName = session.activity.name
        let costPM = session.activity.costpm
        let taxRate = session.location.taxRate
        let setupMinutes = session.activity.setupMin
        let locationName = session.location.name
        let subtotal = costPM * (playTime - setupMinutes)
        let msg = []
        msg.push(``)
        msg.push(`${startDateFormat} - ${endDateFormat}`)
        msg.push(`==============================`)
        msg.push(``)
        msg.push(` location [ ${locationName} ]`)
        msg.push(` activity [ ${activityName} ]`)
        msg.push(`------------------------------`)
        msg.push(``)
        msg.push(` session time:    ${playTime} [min]`)
        msg.push(` setup time:    -  ${setupMinutes} [min]`)
        msg.push(` cost per min:  X $${costPM.toFixed(2)}`)
        msg.push(`------------------------------`)
        msg.push(``)
        msg.push(`     subtotal:    $${subtotal.toFixed(2)}`)
        msg.push(`     tax rate:  X   ${taxRate.toFixed(3)}`)
        msg.push(`==============================`)
        msg.push(`     total:        $${(subtotal * (1+taxRate)).toFixed(2)}`)
        return msg.join('\n');
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
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::schedule session::</Text>
                        </View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.scheduleSession(true)}>
                                <View style={[style.next, style.bigBorder]}>
                                    <Text style={style.boldLabel}>first available</Text>
                                </View>
                            </TouchableNativeFeedback>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h3}>-- or --</Text>
                        </View>
                        <View style={style.colFirst}>
                            <Text style={style.h3}>::pick a time below::</Text>
                        </View>
                        <View style={style.separator}></View>
                        <View style={style.col}>
                            <Picker
                                selectedValue={this.state.selectedSession}
                                style={style.pickerItem}
                                onValueChange={(itemValue) =>
                                    //use array key for now
                                    this.setState({ "selectedSession": itemValue })
                                }>
                                <Picker.Item style={style.pickerItem} key={-2} label="select" value={-2} />
                                {this.state.availableSessionsPicker}
                            </Picker>
                        </View>
                        <View style={style.separator}></View>
                        <View style={style.col}>
                            <TouchableNativeFeedback onPress={() => this.scheduleSession()}>
                                <View style={style.next}>
                                    <Text style={style.label}>schedule</Text>
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
                        <View style={style.separator}></View>
                        <View style={style.colFirst}>
                            <Text style={style.h3}>::pending sessions::</Text>
                        </View>
                        <View style={style.col}></View>
                        {this.state.pendingSessions}
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

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleSession);

