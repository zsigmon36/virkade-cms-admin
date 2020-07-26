import React from 'react';
import Modal from 'react-modal';

const Loader = props => {
    let loading = props.loading || false;
    return (
        <Modal
            isOpen={loading}
            //onAfterOpen={afterOpenModal}
            style={style.wrapper}
            contentLabel="Example Modal"
            onRequestClose={() => { console.log('close modal') }}>
            <div style={style.modalBackground}>
                <div style={style.activityWrapper}>
                    <div style={style.indicator}>
                        <p style={style.label}>loading...</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
export default Loader;

const style = {
    wrapper: {
    },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#00000090'
    },
    activityWrapper: {
        alignItems: 'center',
        height: 100,
        width: '90%',
        backgroundColor: '#001a00',
        borderWidth: 1,
        borderColor: '#9fff80',
    },
    indicator: {
        flex: 1,
        flexDirection: 'row',
        alignItems: "center",
    },
    label: {
        minWidth: 135,
        marginLeft: 10,
        fontSize: 28,
        justifyContent: "flex-start",
        fontFamily: 'TerminusTTFWindows-4.46.0'
    }
}