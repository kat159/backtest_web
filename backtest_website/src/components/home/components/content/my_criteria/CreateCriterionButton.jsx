import React, {useState} from 'react'
import axios from 'axios';
import PubSub from 'pubsub-js';
import CriteriaBuilder from '../test/components/PositionOpen/components/CriteriaBuilder/CriteriaBuilder';

export default function CreateCriterionButton(props) {

    const {userId, retrieveAndSetCriteriaList, } = props

    const [isEditing, setIsEditing] = useState(false)
    const onSaveMsg = 'create_criterion_finish'
    const onCreateClick = () => {
        setIsEditing(true);
        
        PubSub.subscribe(onSaveMsg, (msg, data) => {
            setIsEditing(false);
            retrieveAndSetCriteriaList();
        })
    }

    return (
        <div>
            {isEditing && <CriteriaBuilder onSaveMsg={onSaveMsg} isCreating={true} userId={userId} />}
            <button type='button' onClick={onCreateClick} >Create New Criterion</button>
        </div>
    )
}
