import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import criterionService from '../../../../services/criterionService';
import CriteriaBuilder from '../../popup/CriteriaBuilder';
import PubSub from 'pubsub-js';
import CriteriaTable from './CriteriaTable';
import { Button, Input, Space } from 'antd';

export default function MyCriteria() {
    const userId = localStorage.getItem('userId');
    const onEditFinishMsg = 'my-criteria-edit-finish'
    const onCreateFinishMsg = 'my-criteria-create-finish'
    const onDeleteButtonClickMsg = 'my-criteria-delete-click'
    const onEditBottunClickMsg = 'my-criteria-edit-click'
    const [criterionList, setCriterionList] = useState([]);
    const [isBuildingCriteria, setIsBuildingCriteria] = useState(false);
    const [criterionBeingEdited, setCriterionBeingEdited] = useState(false);
    const [isEditingCriterion, setIsEditingCriterion] = useState(false)

    useEffect(() => {
        
        retrieveCriterionData();

        const token = PubSub.subscribe(onEditBottunClickMsg, (msg, data) => {
            // console.log('EDIT BUTTON:', data)
            const { criterionId, nestedCriterion, criterionName } = data
            setCriterionBeingEdited(data)
            const token2 = PubSub.subscribe(onEditFinishMsg, (msg, data) => {
                setCriterionBeingEdited(false);
                PubSub.unsubscribe(token2);
                retrieveCriterionData();
            })
        })
        const token2 = PubSub.subscribe(onDeleteButtonClickMsg, (msg, data) => {
            const { criterionId, } = data;
            // console.log('DELETE BUTTON:', criterionId)
            criterionService.deleteById(criterionId).then(
                res => {
                    // console.log('Delete Result:', res)
                    retrieveCriterionData();
                }
            )
        })
        return () => {
            PubSub.unsubscribe(token)
            PubSub.unsubscribe(token2)
        }
    }, [])

    const retrieveCriterionData = () => {
        criterionService.getAll(userId).then(
            res => {
                const { err_code, results, } = res.data
                if (err_code === 0) {
                    setCriterionList(results);
                    // console.log('MyCriteriaPage receive request results:', results)
                } else {
                    // console.log('MyCriteriaPage receive request error:', err_code)
                }
            },
            err => {
                // console.log(err);
            }
        );
    }

    const createCriteriaClick = () => {
        setIsBuildingCriteria(true);
        const token = PubSub.subscribe(onCreateFinishMsg, (msg, data) => {
            // console.log('MyCriteria receive finish create criterion data:', data)
            const { forceClosing, } = data;
            if (!forceClosing) {

            }
            PubSub.unsubscribe(token);
            setIsBuildingCriteria(false);
            retrieveCriterionData();
        })
    }
    const fetch = (value, callback) => {
        const fake = () => {
            criterionService.suggestAllWithName(userId, value).then(
                res => {
                    const { results, err_code, } = res;
                    callback(results);
                },
                err => {
                }
            )
        };
        fake();
    };
    const handleSearchNameChange = (e) => {
        const value = e.target.value
        setTimeout(
            () => {
                if (e.target.value === value) { // **把要搜过的value存在本地，300ms之后通过对比之前要搜索的内容和e.target当前的value对比，防止打字过程中的无效搜索
                    fetch(e.target.value, setCriterionList);
                } else {
                    // console.log('Searched value:', value, 'current value:', e.target.value, 'stop searching because value not match as type too fast')
                }
            }, 300
        )
    }

    return (
        <div>
            {isBuildingCriteria && <CriteriaBuilder onFinishMsg={onCreateFinishMsg} />}
            {criterionBeingEdited && <CriteriaBuilder criterionBeingEdited={criterionBeingEdited} onFinishMsg={onEditFinishMsg} />}
            <div style={{ marginLeft: '20px' }}>
                <Space style={{ marginBottom: '10px' }}>
                    <Button type='dashed' onClick={createCriteriaClick} >build criterion</Button>
                    <Input
                        placeholder='search by name'
                        onChange={handleSearchNameChange}
                    ></Input>
                </Space>
                <CriteriaTable onDeleteButtonClickMsg={onDeleteButtonClickMsg} onEditBottunClickMsg={onEditBottunClickMsg} criterionList={criterionList} />
            </div>
        </div>
    )
}
