import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import {CloseOutlined} from '@ant-design/icons'
import PubSub from 'pubsub-js';
import './CriteriaBuilder.css'
import CascadeSelectorTable from '../CascadeSelectorTable/CascadeSelectorTable';
import criterionItemService from '../../../services/criterionItemService';
import CriterionBuilder from './CriterionBuilder/CriterionBuilder';
import { useRef } from 'react';
import { Alert, Input, Form } from 'antd';
import criterionService from '../../../services/criterionService';

export default function CriteriaBuilder(props) {
    const userId = localStorage.getItem('userId');
    const selectorTableRef = useRef(null)
    const criterionBuilderRef = useRef(null)
    const finishButtonRef = useRef(null)
    const excludeClickOutsideRefs = [selectorTableRef, criterionBuilderRef, finishButtonRef]
    const handleClickOutside = event => {
        let isClickingOutside = true;
        for (const ref of excludeClickOutsideRefs) {
            if (!ref.current || ref.current.contains(event.target)) {
                isClickingOutside = false;
                break;
            }
        }
        if (isClickingOutside) {
            setCurRouteOfSelectedBuildingCriterion('');
            setSelectedBuildingCriterionStatus('edit');
        }
    };
    useEffect (() => {
        document.addEventListener("mousedown", handleClickOutside, false);
        setCurRouteOfSelectedBuildingCriterion('0')
        return () => {
            document.removeEventListener("mousedown", handleClickOutside, false);
        };
    }, [])

    const nameInputRef = useRef(null);
    const {itemDict, } = criterionItemService.getAll()
    const {onFinishMsg, criterionBeingEdited} = props; // 告诉父组件criteria building complete
    const onCriterionItemClickMsg = 'criteria-builder-criterion-item-clicked' // CriteiaBuilder获得Table Selector点击的消息
    const onBuildingCriterionClickMsg = 'building-criterion-clicked'    // 获得builder的点击时间

    const [nestedBuilidingCriterion, setNestedBuildingCriterion] = useState(criterionBeingEdited ? criterionBeingEdited.nestedCriterion : [['Cross Above', ['Closing Price'], ['Closing Price']]])
    //[['Cross Above', ['Plus', ['Opening Price'], ['Highest Price']], ['Closing Price']]]
    const [curRouteOfSelectedBuildingCriterion, setCurRouteOfSelectedBuildingCriterion] = useState('0')
    const [selectedBuildingCriterionStatus, setSelectedBuildingCriterionStatus] = useState('edit');
    const [buildingCriterionWarningMsg, setBuildingCriterionWarningMsg] = useState('');
    const [criterionNameExists, setCriterionNameExists] = useState(false)

    const decodeCriterion = () => {
        const helper = (curNestedCriterion, curRoute) => {
            if (curNestedCriterion.length === 0) { // 有未填的空
                return {
                    status: 'Error',
                    error: 'Incomplete',
                    errorDetail: 'Existing incomplete space',
                    location: curRoute,
                }
            }
            const itemName = curNestedCriterion[0];
            const itemInfo = itemDict[itemName];
            const {leadingText, paramTypes, joinChar, returnType} = itemInfo
            if (paramTypes.length === 0) {
                return {
                    status: 'Valid',
                    location: curRoute,
                    criteriaStr: leadingText,
                    returnValueType: returnType,
                }
            }
            let resStr = '';
            let resReturnType = '';

            resStr += leadingText + '(';
            for (let i = 1; i < curNestedCriterion.length; i++) {
                if (i > 1) {
                    resStr += joinChar;
                }
                const childRes = helper(curNestedCriterion[i], curRoute + i);
                if (childRes.status === 'Error') {
                    return childRes;
                } else if (childRes.status === 'Valid') {
                    const requiredParamType = paramTypes[i - 1];
                    if (requiredParamType !== 'Any') {
                        if (requiredParamType !== childRes.returnValueType) {
                            return {
                                status: 'Error',
                                error: 'Invalid Value Type',
                                errorDetail: 'Expect: ' + requiredParamType + ', ' + 'Get: ' + childRes.returnValueType,
                                location: childRes.location,
                            }
                        }
                    }
                    if (returnType !== 'Number' && returnType !== 'Bool' && i === returnType + 1) {
                        resReturnType = childRes.returnValueType;
                    }
                    resStr += childRes.criteriaStr;
                } else {
                    console.error('ERROR: Unexpected Status when check criterion at D:\\Coding_Study\\backtest_final\\backtest_web\\backtest_website\\src\\components\\home\\components\\content\\test\\components\\PositionOpen\\components\\CriteriaBuilder')
                }
            }
            resStr +=')';
            return {
                status: 'Valid',
                location: curRoute,
                criteriaStr: resStr,
                returnValueType: resReturnType || returnType
            }
        }
        let res = helper(nestedBuilidingCriterion[0], '0')
        if (res.status === 'Error') {
            return res
        }
        if (res.returnValueType !== 'Bool') {
            res = {
                status: 'Error',
                error: 'Invalid Value Type',
                errorDetail: 'Returned value type of a criterion function should be Boolean',
                location: res.location,
            }
        }
        return res
    }

    const handleFinishClick = async () => {
        const res = decodeCriterion();
        if(res.status === 'Error') {
            setCurRouteOfSelectedBuildingCriterion(res.location);
            setSelectedBuildingCriterionStatus('warning');
            setBuildingCriterionWarningMsg({message:res.error, description: res.errorDetail});
            return ;
        }
        if (criterionBeingEdited) { // editing
            console.log('Editing Criterion Click...', criterionBeingEdited)
            const {criterionId, } = criterionBeingEdited
            const {data} = await criterionService.updateCriterion(criterionId, userId, nameInputRef.current.input.value, res.criteriaStr, nestedBuilidingCriterion)
            if (data.err_code === 0) {
                PubSub.publish(onFinishMsg, {criteria: nestedBuilidingCriterion, criteriaStr: res.criteriaStr})
            } else {
                setCriterionNameExists(true)
            }
        } else {
            console.log('Adding Criterion Click..')
            const {data} = await criterionService.addCriterion(
                userId, nameInputRef.current.input.value, res.criteriaStr, nestedBuilidingCriterion
            )
            if (data.err_code === 0) {
                PubSub.publish(onFinishMsg, {criteria: nestedBuilidingCriterion, criteriaStr: res.criteriaStr})
            } else {
                setCriterionNameExists(true)
            }
        }
    }

    const handleForceClosingClick = () => {
        PubSub.publish(onFinishMsg, {forceClosing: true});
    }
    
    const replaceCriterion = (replacingItemName) => {
        const helper = (curRoute, curNestedCriterion) => {
            if (curRoute === curRouteOfSelectedBuildingCriterion) {
                const {paramTypes, } = itemDict[replacingItemName]
                return [replacingItemName].concat(paramTypes.map(v => []));
            } else {
                return curNestedCriterion.map((value, index) => {
                    return index === 0 ? curNestedCriterion[0] : helper(curRoute + index, curNestedCriterion[index]);
                })
            }
        }
        const res =  helper('0', nestedBuilidingCriterion[0]);
        setNestedBuildingCriterion([res]);
    }

    useEffect(() => {
        const token1 = PubSub.subscribe(onCriterionItemClickMsg, (msg, data) => {
            const {item, } = data
            replaceCriterion(item)
            
        });
        const token2 = PubSub.subscribe(onBuildingCriterionClickMsg, (msg, data) => {
            const {route, } = data
            setCurRouteOfSelectedBuildingCriterion(route);
            setSelectedBuildingCriterionStatus('edit');
        })
        return () => {
            PubSub.unsubscribe(token1);
        }
    })
    
    const handleNameInputKeyUp = (e) => {
        console.log(e.target.value)
        setCriterionNameExists(false);
    }

    return (
        <div>
            <div style={{
                position:'absolute',
                width: '100%',
                height: '100%',
                left: '0',
                top: '0',
            }}>
            </div>
            <Draggable handle='.criteria-builder-handle'>
                <div className='criteria-builder-outer' >
                    <div className='criteria-builder-handle' >
                        &nbsp; Criteria Builder
                        <CloseOutlined onClick={handleForceClosingClick} style={{float: 'right', marginTop: '4px', marginRight: '3px'}} />  
                    </div>
                    <div ref={selectorTableRef}>
                        <CascadeSelectorTable  onCriterionItemClickMsg={onCriterionItemClickMsg}  />
                    </div>
                    
                    <br />
                    <Form>
                        <Form.Item
                            label="Criterion Name"
                            validateStatus = { criterionNameExists && 'error'}
                            help = { criterionNameExists && 'name exists!'}
                        >
                            <Input defaultValue={criterionBeingEdited ? criterionBeingEdited.criterionName : ''} onKeyUp={handleNameInputKeyUp} ref={nameInputRef} style={{width: '150px', height: '30px'}} />
                        </Form.Item>
                    </Form>
                    
                    
                    
                    <div><b>Current Criterion:</b></div>
                    <div style={{marginTop: '1px', marginBottom: '10px'}} ref={criterionBuilderRef} >
                        {CriterionBuilder(nestedBuilidingCriterion[0], '0', curRouteOfSelectedBuildingCriterion, selectedBuildingCriterionStatus, itemDict, onBuildingCriterionClickMsg, false)}
                    </div>
                    <button onClick={handleFinishClick} ref={finishButtonRef} type='button'>Finish</button>
                    {selectedBuildingCriterionStatus === 'warning' &&  <Alert {...buildingCriterionWarningMsg} type="error" />}
                </div>
            </Draggable>
            
        </div>
    
    )
}
