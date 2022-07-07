import React, {useState} from 'react'
import CriteriaBuilder from './components/CriteriaBuilder/CriteriaBuilder'


export default function PositionOpen(props) {

    const [isBuildingCriteria, setIsBuildingCriteria] = useState(false)
    let {criteriaStr} = props
    if (criteriaStr[0] === '(') {
        criteriaStr = criteriaStr.slice(1, criteriaStr.length - 1);
    }

    const onBuildCriteriaClick = () => {
        if (!isBuildingCriteria) {
            setIsBuildingCriteria(true);
        }
    }

    return (
        <div>
            {isBuildingCriteria && <CriteriaBuilder onFinishMsg='update_open_criterion' setIsBuildingCriteria={setIsBuildingCriteria}  />}
            <fieldset >
                <legend className='legend'>Position Opening</legend>
                <div>{criteriaStr}</div>
                <button onClick={onBuildCriteriaClick} className='btn btn-info' type='button'>Build Criteria</button>
            </fieldset>
        </div>
    )
}
