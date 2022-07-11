import React, {useState} from 'react'
import CriteriaBuilder from '../test/components/PositionOpen/components/CriteriaBuilder/CriteriaBuilder'
import PubSub from 'pubsub-js'
import axios from 'axios'

export default function CriterionRow(props) {
    const {id, user_id, name, criterion_str, criterion_arr} = props.criterion
    const {retrieveAndSetCriteriaList, } = props
    const [isEditing, setIsEditing] = useState(false)

    const onEditFinishMsg = 'edit_criterion';
    const onEditClilck = () => {
        setIsEditing(true);
        
        const token = PubSub.subscribe(onEditFinishMsg, (msg, data) => {
            const {criteriaStr, criteria } = data
            console.log('1111', data, criteriaStr)
            const criterionData =  {...props.criterion, criterion_arr:JSON.stringify(criteria), criterion_str: criteriaStr}
            setIsEditing(false);
            PubSub.unsubscribe(token);
            axios.defaults.baseURL = 'http://127.0.0.1:3000';
            axios({
                method: 'put',
                url: '/criteria/' + id,
                data: criterionData,
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then(
                res => {
                    console.log(res)
                    const {err_code, message, } = res.data
                    if (err_code === 0) {
                    console.log('Edite criterion results:', message)
                    } else {
                    console.log('Edite criterion error:', err_code)
                    }
                    
                },
                err => {console.log(err)}
            )
            retrieveAndSetCriteriaList();
        }) 
    }

    const onDeleteClick = () => {
        axios({
            method: 'delete',
            url: '/criteria/' + id,
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(
            res => {
                console.log(res)
                const {err_code, message, } = res.data
                if (err_code === 0) {
                console.log('Delete criterion results:', message)
                } else {
                console.log('Delete criterion error:', err_code)
                }
                
            },
            err => {console.log(err)}
        )
        retrieveAndSetCriteriaList();
    }

    return (
        <tr>
            {isEditing && <CriteriaBuilder criterionArr={criterion_arr} criteriaStr={criterion_str} onFinishMsg={onEditFinishMsg} isEditing={isEditing} userId={user_id} criterionId={id} criterionName={name} criterionStr={criterion_str} />}
            <td style={{padding: '5px'}}>{name}</td>
            <td style={{padding: '5px'}}>{criterion_str}</td>
            <td style={{padding: '5px'}}>
                <span onClick={onEditClilck} style={{padding: '5px'}}>Edit</span>
                <span onClick={onDeleteClick} style={{padding: '5px'}}>Delete</span>
            </td>
        </tr>
    )
  
}
