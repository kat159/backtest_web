import { CloseOutlined } from '@ant-design/icons';
import React, { useState } from 'react'
import { Rnd } from "react-rnd";

export default function RisizableDraggablePoppup(props) {
    const { handleForceClosingClick, content, title, mask, zIndexOfMask = 2, maskStyle, contentStyle } = props
    const style = {

    };
    const defaultSize = {
        width: 1000,
        height: 1000,
    }
    const [outerSize, setOuterSize] = useState(defaultSize)
    return (
        <Rnd className='risizable-draggable-poppup-outer'
            style={{
                display: "block",
                // alignItems: "center",
                // justifyContent: "center",
                border: "solid 1px #ddd",
                zIndex: 2,
            }}
            default={{
                x: 100,
                y: 100,
                ...defaultSize
            }}
            dragHandleClassName='risizable-draggable-poppup-handle'
            onResize={(e, direction, ref, delta, position) => {
                // console.log(outerSize)
                setOuterSize({
                    width: ref.offsetWidth,
                    height: ref.offsetHeight,
                });
            }}
        >
            <div className='risizable-draggable-poppup-handle' >
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
            <div style={{
                width: outerSize.width
            }}>
                {content}
            </div>

        </Rnd>

    )
}
