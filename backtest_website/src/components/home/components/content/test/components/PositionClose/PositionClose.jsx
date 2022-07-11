import React, {useState } from 'react'
import HoldingDays from './HoldingDays'
import CriteriaBuilder from '../PositionOpen/components/CriteriaBuilder/CriteriaBuilder'
import PubSub from 'pubsub-js'

export default function PositionClose(props) {

    const [isBuildingCriteria, setIsBuildingCriteria] = useState(false)
    let {criteriaStr, userId} = props
    if (criteriaStr[0] === '(') {
        criteriaStr = criteriaStr.slice(1, criteriaStr.length - 1);
    }
    const onFinishMsg = 'update_close_criterion'

    const onBuildCriteriaClick = () => {
        if (!isBuildingCriteria) {
            setIsBuildingCriteria(true);
        }
        const token = PubSub.subscribe(onFinishMsg, (msg, data) => {
            setIsBuildingCriteria(false);
            PubSub.unsubscribe(token);
        })
    }

    return (
        <div>
            {isBuildingCriteria && <CriteriaBuilder userId={userId} onFinishMsg={onFinishMsg} setIsBuildingCriteria={setIsBuildingCriteria}  />}
            <fieldset>
                <legend className='legend'>Position Closing</legend>
                <HoldingDays />
                <div>{criteriaStr}</div>
                <button onClick={onBuildCriteriaClick} className='btn btn-info' type='button'>Build Criteria</button>
            </fieldset>
        </div>
    )
}
