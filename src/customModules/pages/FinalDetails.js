import React, { Component } from 'react';
import {
    TextInput,
    Text,
    View,
    Alert,
    TouchableNativeFeedback,
    ScrollView,
} from 'react-native';
import Header from './Header.js'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class FinalDetails extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this);
        this.updateUser = this.updateUser.bind(this);

    }

    state = {
        playedBefore: '[ ]',
        canContact: '[ ]',
        reServices: '[ ]',
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
    }

    everVrCheckBox = () => {
        if (this.state.playedBefore == '[ ]') {
            this.updateInput({ playedBefore: true })
            this.setState({ playedBefore: '[X]' })
        } else {
            this.updateInput({ playedBefore: false })
            this.setState({ playedBefore: '[ ]' })
        }
    }
    contactCheckBox = () => {
        if (this.state.canContact == '[ ]') {
            this.updateInput({ canContact: true })
            this.setState({ canContact: '[X]' })
        } else {
            this.updateInput({ canContact: false })
            this.setState({ canContact: '[ ]' })
        }
    }
    reCheckBox = () => {
        if (this.state.reServices == '[ ]') {
            this.updateInput({ reServices: true })
            this.setState({ reServices: '[X]' })
        } else {
            this.updateInput({ reServices: false })
            this.setState({ reServices: '[ ]' })
        }
    }

    updateUser() {
        let user = this.props.user
        DatabaseAPI.updateUser(user, this.nextPage)
    }

    clickNext() {
        this.loading(true)
        let user = this.props.user
        if (user.commentContent && user.commentContent != '') {
            DatabaseAPI.addUserComment(user, this.updateUser)
        } else {
            this.updateUser()
        }
    }

    nextPage(data, error) {
        if (data && data.updateUser) {
            this.props.navigation.navigate('TermsConditions')
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong. \n${error[0].message}`)
        } else {
            Alert.alert('::error::', `\nhmmm... \ncould not update the user.`)
        }
        this.loading(false)
    }

    render() {
        return (
            <ScrollView style={style.wrapper}>
                <Loader loading={this.state.loading} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::final info::</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.checkBox} onPress={this.everVrCheckBox}> {this.state.playedBefore} ever experienced VR?</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.checkBox} onPress={this.reCheckBox}> {this.state.reServices} interested in VR real estate services?</Text>
                        </View>
                        <View style={style.col}>
                            <Text style={style.checkBox} onPress={this.contactCheckBox}> {this.state.canContact} can we contact you? </Text>
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
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>legal stuff</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(FinalDetails);