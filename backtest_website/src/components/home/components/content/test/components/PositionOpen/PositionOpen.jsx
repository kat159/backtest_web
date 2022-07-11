import React, {useState} from 'react'
import CriteriaBuilder from './components/CriteriaBuilder/CriteriaBuilder'
import PubSub from 'pubsub-js'

export default function PositionOpen(props) {

    const [isBuildingCriteria, setIsBuildingCriteria] = useState(false)
    let {criteriaStr, userId} = props
    if (criteriaStr[0] === '(') {
        criteriaStr = criteriaStr.slice(1, criteriaStr.length - 1);
    }
    const onFinishMsg = 'update_open_criterion'

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
            {isBuildingCriteria && 
                <div style = {
                    // 设置透明全屏，挡住背后parant的按钮点击
                    // **重要： ？？？？parant的onClick事件挡不住， 
                    // 好像只能挡住parant的按钮和NavLink？？？？？？？？？
                    {
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        left: '0',
                        top: '0',
                        display: 'block',
                    }
                }>
                    <CriteriaBuilder userId={userId} onFinishMsg={onFinishMsg} setIsBuildingCriteria={setIsBuildingCriteria}  />
                </div>
            }
            <fieldset >
                <legend className='legend'>Position Opening</legend>
                <div>{criteriaStr}</div>
                <button onClick={onBuildCriteriaClick} className='btn btn-info' type='button'>Build Criteria</button>
            </fieldset>
        </div>
    )
}
