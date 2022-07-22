import { nanoid } from 'nanoid'
import React, { useState } from 'react'
import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { useRef } from 'react'

export default function CriterionBuilder(
        curNestedCriterion, 
        curRoute, 
        curSelectedRoute, 
        selectionStatus, 
        itemDict, 
        onClickMsg,
        requiredReturnType,
) {
    if(requiredReturnType === 'Exact Number') {
        
    }
    const onClick = (e) => {
        e.stopPropagation()
        PubSub.publish(onClickMsg, {route: curRoute, requiredReturnType: requiredReturnType});
    }

    // 不可以有state //这个组件用了外部给的跟外部state有关的param，如果因为state rerender会丢失param，导致报错
    // const [mouseOver, setMouseOver] = useState(false); 
    const selectionStyle = {
        borderWidth: curSelectedRoute === curRoute ? '3px' : '0px',
        borderStyle: 'solid',
        borderColor: selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : ''
    }
    const onMouseOver = (e) => {
        e.stopPropagation()
        e.currentTarget.style.borderWidth = '4px'
        e.currentTarget.style.borderColor = 'rgb(43, 114, 161)'    // 直接改变dom不会rerender
    }

    const onMouseOut = (e) => {
        e.stopPropagation()
        e.currentTarget.style.borderWidth = curSelectedRoute === curRoute ? '3px' : '0px';
        e.currentTarget.style.borderColor = selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : ''
    }

    if (curNestedCriterion.length === 0) {
        return <span onMouseOver={onMouseOver} onMouseOut={onMouseOut} onClick={onClick} key={nanoid()} style={
            {   backgroundColor: 'white', 
                ...selectionStyle
            }
        }>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
    }
    const itemName = curNestedCriterion[0]
    const itemInfo = itemDict[itemName]
    const {leadingText, joinChar, paramTypes} = itemInfo

    const children = []
    for (let i = 1; i < curNestedCriterion.length; i++) {
        if (i > 1) {
            children.push(<span key={nanoid()} >{joinChar}</span>)
        }
        children.push(
            CriterionBuilder(curNestedCriterion[i], curRoute + i, curSelectedRoute, selectionStatus, itemDict, onClickMsg)
        )
    }

    return (
        <span onMouseOver={onMouseOver} onMouseOut={onMouseOut} onClick={onClick} key={nanoid()} style={{
            ...selectionStyle,
        }}
        >
            {leadingText}{paramTypes.length > 0 && '( '}
            {children}
            {paramTypes.length > 0 && ' )'}
        </span>
    )
}
