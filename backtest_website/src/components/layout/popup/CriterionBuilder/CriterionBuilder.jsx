import { nanoid } from 'nanoid'
import React, { useState } from 'react'
import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { useRef } from 'react'
import { Input, message, Tooltip } from 'antd'

export default function CriterionBuilder(
    curNestedCriterion,
    curRoute,
    curSelectedRoute,
    selectionStatus,
    itemDict,
    onClickMsg,
    requiredReturnType,
    handleInputValueChange,
) {
    if (requiredReturnType === 'Exact Number') {

    }
    const onClick = (e) => {
        e.stopPropagation()
        PubSub.publish(onClickMsg, { route: curRoute, requiredReturnType: requiredReturnType });
    }

    const isTextInput = curNestedCriterion.length > 0
        && (curNestedCriterion[0] === '' || !isNaN(parseInt(curNestedCriterion[0][0]))); // Exact Number Input

    // 不可以有state //这个组件用了外部给的跟外部state有关的param，如果因为state rerender会丢失param，导致报错
    // const [mouseOver, setMouseOver] = useState(false); 
    const selectionStyle = {
        borderWidth: curSelectedRoute === curRoute ? '2px' : '0px',
        borderStyle: 'solid',
        borderColor: selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : ''
    }
    const onMouseOver = (e) => {
        e.stopPropagation()
        e.currentTarget.style.borderWidth = '3px'
        e.currentTarget.style.borderColor = 'rgb(43, 114, 161)'    // 直接改变dom不会rerender
    }

    const onMouseOut = (e) => {
        e.stopPropagation()
        e.currentTarget.style.borderWidth = curSelectedRoute === curRoute ? '2px' : '0px';
        e.currentTarget.style.borderColor = selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : ''
    }

    let returnComponent = '';
    if (curNestedCriterion.length === 0) {  // Empty
        returnComponent =
            <Tooltip
                key={nanoid()} placement="topRight" title={'Required Value Type: ' + requiredReturnType}
            >
                <span
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onClick={onClick}
                    key={nanoid()}
                    style={
                        {
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            ...selectionStyle
                        }
                    }>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
            </Tooltip>
    } else if (isTextInput) {   // Exact Number Input
        const curVal = curNestedCriterion[0];
        const onChange = (e) => {
            const value = e.target.value
            if (value.length > 0) {
                if (value[0] === '0') {
                    message.error('Using future value is not allowed.')
                } else if (value[0] === '-') {
                    message.error('Using future value is not allowed.')
                } else if (value[value.length - 1] === '.') {
                    message.error('Only Integer allowed')
                }
            }
            e.target.value = value.replace(/[^0-9]*/g, '');
            handleInputValueChange(e.target.value);
        }
        returnComponent =
            <Tooltip
                key={nanoid()} placement="topRight" title={'Required Value Type: ' + requiredReturnType}
            >
                <input
                    onChange={onChange}
                    defaultValue={curVal}
                    autoFocus={curSelectedRoute === curRoute}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onClick={onClick}
                    key={nanoid()}
                    style={
                        {
                            backgroundColor: curSelectedRoute !== curRoute && curVal.length > 0 ? 
                                                '#c4cbff' : 'white',
                            ...selectionStyle,
                            height: '20px',
                            width: curSelectedRoute !== curRoute && curVal.length > 0 ? 
                                    curVal.length * 8 + 'px' : 
                                    Math.max(curVal.length * 8, 20) + 'px',
                            padding: 0,
                        }
                    }></input>
            </Tooltip>

    } else {
        const itemName = curNestedCriterion[0]
        const itemInfo = itemDict[itemName]
        const { leadingText, joinChar, paramTypes } = itemInfo

        const children = []
        for (let i = 1; i < curNestedCriterion.length; i++) {
            if (i > 1) {
                children.push(<span key={nanoid()} >{joinChar}</span>)
            }
            children.push(
                CriterionBuilder(curNestedCriterion[i], curRoute + i, curSelectedRoute, selectionStatus, itemDict, onClickMsg, paramTypes[i - 1], handleInputValueChange)
            )
        }
        returnComponent = <span
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onClick={onClick}
            key={nanoid()}
            style={{
                ...selectionStyle,
                cursor: 'pointer',
            }}
        >
            {leadingText}{paramTypes.length > 0 && '( '}
            {children}
            {paramTypes.length > 0 && ' )'}
        </span>
    }

    return (
        returnComponent
    )
}
