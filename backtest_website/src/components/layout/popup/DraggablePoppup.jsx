import { Modal } from 'antd';
import React from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import Draggable from 'react-draggable';

export default function DraggablePoppup(props) {
    const {onOkCallback, onCancelCallback, contentElement} = props

    const handleCancel = () => {
        onCancelCallback(false);
      };

    return (
        <Draggable handle='.ant-modal-header'>
            <Modal title='aaaaaaaaaa'
                visible={true} 
                onCancel={handleCancel}

            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Modal>
        </Draggable>
    );
}
