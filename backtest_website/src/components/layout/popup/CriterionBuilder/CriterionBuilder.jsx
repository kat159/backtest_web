import { nanoid } from 'nanoid'
import React, { useState } from 'react'
import PubSub from 'pubsub-js'
import { useEffect } from 'react'
import { useRef } from 'react'
import { Button, Input, message, Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined, ColumnWidthOutlined, DoubleRightOutlined, EditOutlined, ExpandAltOutlined } from '@ant-design/icons'
import criterionService from '../../../../services/criterionService'

export default function CriterionBuilder(
    curNestedCriterion,
    curRoute,
    curSelectedRoute,
    selectionStatus,
    itemDict,
    onClickMsg,
    requiredReturnType,
    handleInputValueChange,
    temporaryCriterionList,
    toolTips,
    handleDeleteClick,
) {
    if (requiredReturnType === 'Exact Number') {

    }
    const onClick = (e) => {
        e.stopPropagation()
        PubSub.publish(onClickMsg, { route: curRoute, requiredReturnType: requiredReturnType });
    }

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
    const exactInputId = 'E_x_A_c_T_i_N_p_U_t#'
    const isTempItem = curNestedCriterion.length > 0 && curNestedCriterion[0].indexOf('tempItem#') >= 0
    const isTextInput = curNestedCriterion.length > 0 && curNestedCriterion[0].indexOf(exactInputId) >= 0
    if (curNestedCriterion.length === 0) {  // Empty
        returnComponent =
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
                <Tooltip
                    mouseEnterDelay={toolTips ? 0.5 : 99999}
                    key={nanoid()} placement="topRight" title={'Required Value Type: ' + requiredReturnType}
                >
                    <span
                    >
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    </span>
                </Tooltip>
            </span>

    } else if (isTempItem) {                          // temp item
        const itemId = curNestedCriterion[0]
        let tempItem = undefined
        for (const item of temporaryCriterionList) {
            if (item.id === itemId) {
                tempItem = item
            }
        }
        if (tempItem === undefined) console.error('temp item id not found in CriterionBuilder')
        else {
            returnComponent = <span>
                <span
                    key={nanoid()}
                    onMouseOver={onMouseOver}
                    onMouseOut={onMouseOut}
                    onClick={onClick}

                    style={
                        {
                            cursor: 'pointer',
                            ...selectionStyle
                        }
                    }>{tempItem.name}
                </span>
                {
                    curSelectedRoute === curRoute &&
                    <CloseOutlined className='my-action-tag'
                        style={{
                            fontSize: '10px'
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(e);
                        }}
                    />
                }
            </span>
        }

    } else if (isTextInput) {   // Exact Number Input
        // console.log(curSelectedRoute, curRoute);
        const curVal = curNestedCriterion[0].slice(exactInputId.length);
        const onChange = (e) => {
            const canBeNumber = criterionService.canBeNumber(requiredReturnType)
            // const canBeNumber = requiredReturnType.indexOf('Number') !== -1
            if (canBeNumber) {
                e.target.value = e.target.value.replace(/[^0-9-.]*/g, '');
            } else {
                e.target.value = e.target.value.replace(/[^0-9]*/g, '');
            }
            handleInputValueChange(e.target.value, requiredReturnType);
        }

        returnComponent =
            <span
                key={nanoid()}
                // onMouseOver={onMouseOver}
                // onMouseOut={onMouseOut}
                onMouseOver={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const inputStyle = e.currentTarget.querySelector('input').style
                    inputStyle.outlineWidth = '3px'         // **Input的border在内侧，outline才是相当于其他元素的border！！
                    if (curSelectedRoute !== curRoute) {
                        inputStyle.outlineColor = 'rgb(43, 114, 161)'
                    }
                }}
                onMouseOut={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    const inputStyle = e.currentTarget.querySelector('input').style
                    inputStyle.outlineWidth = curSelectedRoute === curRoute ? '2px' : '0px';
                    inputStyle.outlineColor = selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : '#c4cbff'
                }}
            >
                <Tooltip
                    mouseEnterDelay={toolTips ? 0.5 : 99999}
                    placement="topRight" title={'Required Value Type: ' + requiredReturnType}
                >
                    <input
                        className='exact-number-input'
                        onChange={onChange}
                        onClick={onClick}
                        defaultValue={curVal}
                        autoFocus={curSelectedRoute === curRoute}
                        style={
                            {
                                backgroundColor: curSelectedRoute !== curRoute && curVal.length > 0 ?
                                    '#c4cbff' : 'white',
                                width: curSelectedRoute !== curRoute && curVal.length > 0 ?
                                    4 + curVal.length * 8 + 'px' :
                                    Math.max(4 + curVal.length * 8, 30) + 'px',
                                outlineWidth: curSelectedRoute === curRoute ? '2px' : '0px',
                                outlineColor: selectionStatus === 'edit' ? 'blue' : selectionStatus === 'warning' ? 'red' : ''
                            }
                        }
                    ></input>
                </Tooltip>
            </span>


    } else {                        // table criterion item
        const itemName = curNestedCriterion[0]
        const itemInfo = itemDict[itemName]
        const { leadingText, joinChar, paramTypes } = itemInfo

        const children = []
        for (let i = 1; i < curNestedCriterion.length; i++) {
            if (i > 1) {
                children.push(<span key={nanoid()} >{joinChar}</span>)
            }
            children.push(
                CriterionBuilder(
                    curNestedCriterion[i], curRoute + i, curSelectedRoute,
                    selectionStatus, itemDict, onClickMsg, paramTypes[i - 1],
                    handleInputValueChange, temporaryCriterionList, toolTips, handleDeleteClick,
                )
            )
        }
        const key = nanoid()
        returnComponent = <span>
            <span
                onMouseOver={e => {
                    onMouseOver(e)
                    // console.log(e.currentTarget)
                    // e.currentTarget.querySelector('#anticon-close' + key).style.fontSize = '10px'

                }
                }
                onMouseOut={e => {
                    onMouseOut(e)
                    // console.log(e.currentTarget)
                    // e.currentTarget.querySelector('#anticon-close' + key).style.fontSize = '0px'

                }

                }
                onClick={onClick}
                key={key}
                style={{
                    ...selectionStyle,
                    cursor: 'pointer',
                }}
            >
                {leadingText}{paramTypes.length > 0 && '( '}
                {children}
                {paramTypes.length > 0 && ' )'}

            </span>
            {
                curSelectedRoute === curRoute &&
                <CloseOutlined className='my-action-tag'
                    style={{
                        fontSize: '10px'
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick(e);
                    }}
                />
            }
        </span>

    }

    return (
        <span key={nanoid()}
            onMouseOut={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseEnter={(e) => {
                e.preventDefault();
                // e.stopPropagation();     // 会导致tooltips不显示
                // console.log('enter', e.target)
            }}
            onMouseLeave={(e) => {
                e.preventDefault();
                // e.stopPropagation(); 
                // console.log('leave', e.target)
            }}
        >
            {
                returnComponent
            }
        </span>

    )
}
