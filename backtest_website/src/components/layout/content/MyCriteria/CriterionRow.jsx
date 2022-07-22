import React, {useState} from 'react'
import PubSub from 'pubsub-js'

export default function CriterionRow(props) {
    const {criterion, onEditBottunClickMsg, onDeleteButtonClickMsg} = props
    const {id, user_id, name, criterion_str, criterion_arr} = props.criterion

    const onEditButtonClick = () => {
        PubSub.publish(onEditBottunClickMsg, {nestedCriterion: criterion_arr, criterionId: id, criterionName: name})
    }

    const onDeleteButtonClick = () => {
        PubSub.publish(onDeleteButtonClickMsg, {criterionId: id})
    }

    return (
        <tr className='my-table-row' >
            <td style={{padding: '5px'}}>{name}</td>
            <td style={{padding: '5px'}}>{criterion_str}</td>
            <td style={{padding: '5px'}}>
                <a onClick={onEditButtonClick} style={{padding: '5px'}}>Edit</a>
                <a onClick={onDeleteButtonClick} style={{padding: '5px'}}>Delete</a>
            </td>
        </tr>
    )
  
}
