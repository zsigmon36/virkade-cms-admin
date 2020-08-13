import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CustomAlert = props => {
    let { isOpen, type, msg, onClose } = props;
    isOpen = isOpen || false;
    type = type || 'info';
    msg = msg || 'this is an alert';

    return (
        <Modal
            aria={{
                labelledby: "alert-label",
                describedby: "alert-label"
            }}
            isOpen={isOpen}
            //onAfterOpen={afterOpenModal}
            style={style}
            contentLabel="Example Modal"
            onRequestClose={() => { console.log('close modal') }}>
            {type === 'info' && '::info::'}
            {type === 'success' && '::success::'}
            {type === 'error' && '::error::'}

            <div style={style.wrapper}>
                <div id='alert-label' style={style.label}>
                    <p >{msg}</p>
                </div>
                <div>
                    <button onClick={onClose()}>ok</button>
                </div>
            </div>

        </Modal>
    )
}

export default CustomAlert;

const style = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        position: 'absolute',
        top: 1,
        width: 400,
        alignText: 'center',
        height: 225,
        left: '50%',
        marginLeft: -200,
        border: '1px solid #9fff80',
        background: '#001a00',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: 0,
        outline: 'none',
        padding: 10,
        fontSize: 18,
        display: 'block',
        boxSizing: 'border-box',
    },
    label: {
        display: 'flex',
        alignSelf: 'center',
        alignItems: 'center',
        flexGrow: 1,
        height: 110,
    }
}