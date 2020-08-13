import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const Loader = props => {
    let loading = props.loading || false;
    return (
        <Modal
            aria={{
                labelledby: "loading",
            }}
            isOpen={loading}
            //onAfterOpen={afterOpenModal}
            style={style}
            contentLabel="Loading Modal"
            onRequestClose={() => { console.log('close modal') }}>
            <div id='loading' style={style.label}>loading...</div>
        </Modal>
    );
}
export default Loader;

const style = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content: {
        position: 'absolute',
        width: 300,
        alignText: 'center',
        height: 100,
        left: '50%',
        top: '50%',
        marginLeft: -150,
        marginTop: -50,
        border: '1px solid #9fff80',
        background: '#001a00',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: 0,
        fontSize: 28
    },
    label: {
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    }
}