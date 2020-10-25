import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ConfirmationModal = props => {
    let { isOpen, title, body, onClose, onSubmit } = props;
    isOpen = isOpen || false;
    title = title || '';

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
                <div className='row' id='alert-label' style={ style.label }>
                    <h2>{ title }</h2>
                </div>
                { body }
              
                { onSubmit && 
                    <div className='row'>
                        <button style={style.button} onClick={ onSubmit }>submit</button>
                    </div>
                }

                <div className='row'>
                    <button style={style.button} onClick={ onClose }>close</button>
                </div>


        </Modal>
    )
}

export default ConfirmationModal;

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
        flexDirection: 'row',
    },
    content: {
        position: 'absolute',
        top: 1,
        width: 600,
        alignText: 'center',
        left: '50%',
        right: 'unset',
        bottom: 'unset',
        marginLeft: -300,
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
    },
    button: {
        justifyContent: 'center',
        width: '100%',
    }
}