import React from 'react'
import PubSub from 'pubsub-js'

export default function TableItem(props) {
    const {items, onSelectorItemClickMsg, onCriterionItemClickMsg, index, itemDict, item, selectedItemName } = props

    const onClick = () => {
        if (itemDict[item]) { // criterion item
            PubSub.publish(onCriterionItemClickMsg, {item: item});
        } else {
            PubSub.publish(onSelectorItemClickMsg, {index: index, item: item});
        }
    }

    return (
        <div className='clickable-item'  style={{
            backgroundColor: selectedItemName === item ? '#6578b5' : 'white',
            width: '200px',
            height: '30px',
            textIndent: '20px',
            lineHeight: '30px',
            borderStyle: 'solid',
            borderColor: '#a1a1a1',
            borderWidth: '1px',
            marginTop: '-1px',
            marginLeft: '-1px'
            
        }} onClick={onClick} ><b>{item}</b></div>
    )
}
