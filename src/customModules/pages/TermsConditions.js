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
import { tandc } from '../static/tandc'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import userAction from './reduxActions/UserAction'
import { DatabaseAPI } from './dataAccess/DatabaseAPI.js'
import Loader from './Loader.js';
import style from '../static/styles.js'

class TermsConditions extends Component {

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
            this.updateInput({ tcAgree: true })
            this.setState({ agree: '[X]' })
        } else {
            this.updateInput({ tcAgree: false })
            this.setState({ agree: '[ ]' })
        }
    }

    clickNext() {
        this.loading(true)
        let user = this.props.user
        if (user.tcAgree) {
            DatabaseAPI.addUserLegalDoc(user, user.tcTypeCode, true, this.nextPage)
        } else {
            this.loading(false)
            Alert.alert('::info::', '\nyou must agree to the terms and conditions to continue')
        }

    }

    nextPage(data, error) {
        if (data && data.addUserLegalDoc) {
            this.props.navigation.navigate('LimitedLiable')
        } else if (error) {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.  \n${error[0].message}`)
        } else {
            Alert.alert('::error::', `\nhmmm... \nlooks like something went wrong.`)
        }
        this.loading(false)
    }

    render() {
        let termsAndConds = tandc.enUS;
        return (
            <ScrollView style={style.wrapper}>
                <Loader loading={this.state.loading} />
                <Header />
                <View style={style.body}>
                    <View style={style.spacer}></View>
                    <View style={style.main}>
                        <View style={style.colFirst}>
                            <Text style={style.h1}>::terms & conditions::</Text>
                        </View>
                        <View style={[style.col, style.border, style.padit]}>
                            <Markdown style={mdStyle}>{termsAndConds}</Markdown>
                        </View>
                        <View style={[style.col, style.edgeSpace]}>
                            <Text style={style.checkBox} onPress={this.agreeCheckBox}> {this.state.agree} do you agree to the terms and conditions?</Text>
                        </View>
                        <View style={[style.col, style.edgeSpace]}>
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

export default connect(mapStateToProps, mapDispatchToProps)(TermsConditions);

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