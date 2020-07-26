import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Alert,
    TouchableNativeFeedback,
    ScrollView,
} from 'react-native';
import Header from './Header.js'
import Markdown from 'react-native-markdown-display';
import { liabilityWaiver } from '../static/liabilityWaiver'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { defaultState } from '../static/reduxDefault'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class LimitedLiable extends Component {

    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this);
    }

    state = {
        agree: '[ ]',
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

    agreeCheckBox = () => {
        if (this.state.agree == '[ ]') {
            this.updateInput({ liableAgree: true })
            this.setState({ agree: '[X]' })
        } else {
            this.updateInput({ liableAgree: false })
            this.setState({ agree: '[ ]' })
        }
    }

    clickNext() {
        this.loading(true)
        let user = this.props.user
        if (user.liableAgree) {
            DatabaseAPI.addUserLegalDoc(user, user.liableTypeCode, true, this.nextPage)
        } else {
            this.loading(false)
            Alert.alert('::info::', '\nyou must agree to the liability waiver to continue')
        }

    }

    nextPage(data, error) {
        if (data && data.addUserLegalDoc) {
            this.updateInput({ resetDefaults: defaultState })
            Alert.alert('::info::', '\nthanks for registering \nyou are all set, login and schedule your play time :)')
            this.props.navigation.navigate('Splash')
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.   \n${error[0].message}`)
        } else {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    render() {
        let waiver = liabilityWaiver.enUS
        return (
            <ScrollView style={style.wrapper}>
                <Loader loading={this.state.loading} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::liability waiver::</Text>
                        </View>
                        <View style={[style.col, style.border, style.padit]}>
                            <Markdown style={mdStyle}>{waiver}</Markdown>
                        </View>
                        <View style={[style.col, style.edgeSpace]}>
                            <Text style={style.checkBox} onPress={this.agreeCheckBox}> {this.state.agree} do you agree to waive liability?</Text>
                        </View>
                        <View style={[style.col, style.edgeSpace]}>
                            <TouchableNativeFeedback onPress={() => this.clickNext()}>
                                <View style={style.next}>
                                    <Text style={style.label}>finish</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(LimitedLiable);

const mdStyle = StyleSheet.create({
    text: {
        color: '#9fff80',
        fontFamily: 'TerminusTTFWindows-Bold-4.46.0',
    },
    listOrderedItemIcon: {
        color: '#9fff80',
        marginLeft: 10,
        marginRight: 10,
        lineHeight: 34,
    },
    listUnorderedItemIcon: {
        color: '#9fff80',
        marginLeft: 10,
        marginRight: 10,
        lineHeight: 34,
    },
});