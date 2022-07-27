import React, {useState} from 'react'
import PubSub from 'pubsub-js'

export default function CriterionRow(props) {
    const {criterion, onEditBottunClickMsg, onDeleteButtonClickMsg} = props
    const {id, user_id, name, criterion_str, criterion_arr, description} = props.criterion

    const onEditButtonClick = () => {
        PubSub.publish(onEditBottunClickMsg, {criterionId: id, criterionName: name, description: description})
    }

    const onDeleteButtonClick = () => {
        PubSub.publish(onDeleteButtonClickMsg, {criterionId: id})
    }

    return (
        <tr className='my-table-row' >
            <td style={{padding: '5px'}}>{name}</td>
            <td style={{padding: '5px'}}>{description.length === 0 ? '-' : description}</td>
            <td style={{padding: '5px'}}>
                <a onClick={onEditButtonClick} style={{padding: '5px'}}>Edit</a>
                <a onClick={onDeleteButtonClick} style={{padding: '5px'}}>Delete</a>
            </td>
        </tr>
    )
  
}
