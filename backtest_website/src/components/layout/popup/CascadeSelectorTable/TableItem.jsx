import React from 'react'
import PubSub from 'pubsub-js'
import { Tooltip } from 'antd';
import { nanoid } from 'nanoid';

export default function TableItem(props) {
    const { items, onSelectorItemClickMsg, onCriterionItemClickMsg, index, itemDict, item, selectedItemName, toolTips} = props
    const isCriterionItem = (itemDict[item] !== undefined);
    const onClick = () => {
        if (itemDict[item]) { // criterion item
            PubSub.publish(onCriterionItemClickMsg, { item: item });
        } else {
            PubSub.publish(onSelectorItemClickMsg, { index: index, item: item });
        }
    }

    const toolTipTitle = () => {
        if (!isCriterionItem) return <></>
        const info = itemDict[item]
        const { description, paramTypes, usage, returnType} = info
        const children = []
        if (description && description.length > 0) {
            const child = <div key={nanoid()}>
                <div style={{fontWeight: '600'}} >Description: </div>
                <div style={{marginLeft: '10px'}}>{description.toString()}</div>
            </div>
            children.push(child)
        }
        if (paramTypes && paramTypes.length > 0) {
            const child = <div key={nanoid()}>
                <div style={{fontWeight: '600'}} >Param Types: </div>
                {
                    paramTypes.map((paramType, index) => 
                        <div key={nanoid()} style={{marginLeft: '10px'}}>{paramType + (index < paramTypes.length - 1 ? ', ' : '')}</div>
                    )
                }
            </div>
            children.push(child)
        }
        {
            const child = <div key={nanoid()}>
                <div style={{fontWeight: '600'}} >Return Type: </div>
                <div style={{marginLeft: '10px'}}>
                    {
                        Number.isInteger(returnType) ?
                            'Depends on the return type of the param at index ' + returnType :
                            returnType
                    }
                </div>
            </div>
            children.push(child);
        }
        if (usage && usage.length > 0) {
            const child = <div key={nanoid()}>
                <div style={{fontWeight: '600'}} >Common Usage: </div>
                <div style={{marginLeft: '10px'}}>{usage.toString()}</div>
            </div>
            children.push(child)
        }
        return <div key={nanoid()}>
            {children}
        </div>
    }

    const res = <div key={nanoid()} className='clickable-item' style={{
        backgroundColor: selectedItemName === item ? '#6578b5' : 'white',
        // width: '110%',
        minWidth: '200px',
        height: '30px',
        textIndent: '20px',
        paddingRight: '20px',
        lineHeight: '30px',
        borderStyle: 'solid',
        borderColor: '#a1a1a1',
        borderWidth: '1px',
        marginTop: '-1px',
        marginLeft: '-1px',
        zIndex: 3,
        display: 'block',
        position: 'relative'

    }} onClick={onClick} ><b>{item}</b></div>

    return (
        isCriterionItem ?
            <Tooltip
                mouseEnterDelay={toolTips ? 0.5 : 99999}
                placement='left'
                title={toolTipTitle()}
                color='cyan'
            >
                {res}
            </Tooltip> :
            res

    )
}
