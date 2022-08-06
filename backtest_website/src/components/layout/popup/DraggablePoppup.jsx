import { CloseOutlined } from '@ant-design/icons'
import React from 'react'
import Draggable from 'react-draggable'
import './DraggablePoppup.css'

export default function DraggablePoppup(props) {
    const { handleForceClosingClick, content, title, mask, zIndexOfMask = 2, maskStyle, contentStyle } = props
    return (
        <div>
            {   mask &&
                <div className='draggable-mask' style={{
                    zIndex: zIndexOfMask,
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    ...maskStyle
                }} />
            }
            <Draggable handle='.draggable-poppup-handle'>
                <div style={{ zIndex: '2' }} className='draggable-poppup-outer' >
                    <div className='draggable-poppup-handle' >
                        &nbsp; {title}
                        <CloseOutlined
                            onClick={handleForceClosingClick}
                            style={{
                                float: 'right',
                                marginTop: '4px',
                                marginRight: '3px',
                                ...contentStyle
                            }} />
                    </div>
                    {content}
                </div>
            </Draggable>
        </div>
    )
}
