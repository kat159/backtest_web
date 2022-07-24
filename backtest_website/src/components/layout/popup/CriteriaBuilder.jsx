import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import { CloseOutlined, QuestionOutlined } from '@ant-design/icons'
import PubSub from 'pubsub-js';
import './CriteriaBuilder.css'
import CascadeSelectorTable from './CascadeSelectorTable/CascadeSelectorTable';
import criterionItemService from '../../../services/criterionItemService';
import CriterionBuilder from './CriterionBuilder/CriterionBuilder';
import { useRef } from 'react';
import { Alert, Input, Form, Space, message, Tag } from 'antd';
import criterionService from '../../../services/criterionService';
import CriterionSearchSelector from '../../selector/CriterionSearchSelector';

export default function CriteriaBuilder(props) {
    const userId = localStorage.getItem('userId');
    const selectorTableRef = useRef(null)
    const criterionBuilderRef = useRef(null)
    const finishButtonRef = useRef(null)
    const saveTempCriterionButtonRef = useRef(null)
    const temporaryCriterionTagsRef = useRef(null)
    const excludeClickOutsideRefs = [selectorTableRef, criterionBuilderRef, finishButtonRef, saveTempCriterionButtonRef, temporaryCriterionTagsRef]
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
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside, false);
        setCurRouteOfSelectedBuildingCriterion('0')
        return () => {
            document.removeEventListener("mousedown", handleClickOutside, false);
        };
    }, [])

    const nameInputRef = useRef(null);
    const { itemDict, } = criterionItemService.getAll()
    const { onFinishMsg, criterionBeingEdited } = props; // 告诉父组件criteria building complete
    const onCriterionItemClickMsg = 'criteria-builder-criterion-item-clicked' // CriteiaBuilder获得Table Selector点击的消息
    const onBuildingCriterionClickMsg = 'building-criterion-clicked'    // 获得builder的点击时间

    const [nestedBuilidingCriterion, setNestedBuildingCriterion] = useState(criterionBeingEdited ? criterionBeingEdited.nestedCriterion : [[]])
    //[['Cross Above', ['Plus', ['Opening Price'], ['Highest Price']], ['Closing Price']]]
    const [curRouteOfSelectedBuildingCriterion, setCurRouteOfSelectedBuildingCriterion] = useState('0')
    const [selectedBuildingCriterionStatus, setSelectedBuildingCriterionStatus] = useState('edit');
    const [buildingCriterionWarningMsg, setBuildingCriterionWarningMsg] = useState('');
    const [criterionNameExists, setCriterionNameExists] = useState(false)

    const [temporaryCriterionList, setTemporaryCriterionList] = useState([]);
    const onTemporaryCriterionClick = (nestedCriterion) => {
        if (curRouteOfSelectedBuildingCriterion === '') {   // 未选中要替换的
            message.warn('Selected the item you want to replace in \'Current Criterion\' ')
            return
        }
        handleInsertCriterion(nestedCriterion);
    }
    const onTemporaryCriterionDelete = (criterionId) => {
        const newDate = temporaryCriterionList.filter(temporaryCriterion => {
            return temporaryCriterion.id !== criterionId;
        })
        setTemporaryCriterionList(newDate);
    }
    const handleSaveToTemporaryCriterion = () => { // button click
        if (curRouteOfSelectedBuildingCriterion === '') {
            message.warn('Selected the item in \'Current Criterion\' that you want to save')
            return
        }
        const nestedCriterion = getCurSelectedBuildingCriterion()
        const criterionStr = stringfyCriterion(nestedCriterion);
        const newData = [...temporaryCriterionList, { id: nanoid(), criterionStr: criterionStr, nestedCriterion: nestedCriterion }]
        setTemporaryCriterionList(newData);
    }
    const stringfyCriterion = (nestedCriterion) => {  // no validity check, replace empty array with __
        const helper = (curNestedCriterion) => {
            if (curNestedCriterion.length === 0) { // 有未填的空
                return '__';
            }
            if (curNestedCriterion[0] === '') {     // unfilled Exact Number
                return '__';
            }
            if (!isNaN(parseInt(curNestedCriterion[0]))) {  // Exact Number
                return curNestedCriterion[0]
            }
            const itemName = curNestedCriterion[0];
            const itemInfo = itemDict[itemName];
            const { leadingText, paramTypes, joinChar, returnType } = itemInfo
            if (paramTypes.length === 0) {  // 不需要param
                return leadingText
            }
            let resStr = '';
            resStr += leadingText + '(';
            for (let i = 1; i < curNestedCriterion.length; i++) {
                if (i > 1) {
                    resStr += joinChar;
                }
                resStr += helper(curNestedCriterion[i]);
            }
            resStr += ')';
            return resStr
        }
        const res = helper(nestedCriterion);
        return res
    }
    const getCurSelectedBuildingCriterion = () => {
        const helper = (curRoute, curNestedCriterion) => {
            if (curRoute === curRouteOfSelectedBuildingCriterion) {
                return getDeepcopyOfNestedCriterion(curNestedCriterion);
            } else {
                for (let i = 1; i < curNestedCriterion.length; i++) {
                    const res = helper(curRoute + i, curNestedCriterion[i]);
                    if (res) return res;
                }
            }
            return undefined
        }
        return helper('0', nestedBuilidingCriterion[0])
    }
    const checkParamType = (nestedCriterion) => {    // only check type, exclude empty error
        const helper = (curRoute, nestedCriterion) => {
            if (nestedCriterion.length === 0) {     // 未填
                return {
                    status: 'Valid',
                    returnType: 'Empty',
                    location: curRoute
                }
            }
            const itemName = nestedCriterion[0];
            if (itemName === '' ) {                 // 空的Input框
                return {
                    status: 'Valid',
                    returnType: 'Empty Input',     
                    location: curRoute
                }
            }
            if (!isNaN(parseInt(itemName[0]))) {  // Exact Number 的input框
                // 注意** 没有检查input empty， input必须有数字，在checkEmpty中要查
                return {
                    status: 'Valid',
                    returnType: 'Exact Number',     // 返回Exact
                    location: curRoute
                }
            }

            const itemInfo = itemDict[itemName];
            const { paramTypes, returnType } = itemInfo
            if (nestedCriterion.length === 1) {     // 没有params
                return {
                    status: 'Valid',
                    returnType: returnType,
                    location: curRoute
                }
            }
            let curReturnType = returnType
            let hasEmptyChild = false
            let hasEmptyInput = false
            let exactNumberCounter = 0;
            for (let i = 1; i < nestedCriterion.length; i++) {
                const res = helper(curRoute + i, nestedCriterion[i]);
                const { status, returnType } = res
                if (status === 'Error') {
                    return res
                } else if (status === 'Valid') {
                    const requiredType = paramTypes[i - 1]
                    if (res.returnType === 'Empty') {        // child 是 Empty
                        hasEmptyChild = true
                        if (requiredType.indexOf('Exact Number') >= 0) {        // 检测代码问题
                            // required param type包括Exact， 那么child不该是Empty而是Input框,或者其他item
                            return {
                                status: 'Error',
                                error: 'Unexpected System Error',
                                errorDetail: 'Expect: ' + requiredType + ', ' + 'Get: ' + res.returnType,
                                location: curRoute + i
                            }
                        }
                    } else if (res.returnType === 'Empty Input') {        // child 是 Empty Input
                        hasEmptyInput = true
                        if (requiredType.indexOf('Exact Number') === -1) {       //检测代码问题 
                            // required param type不包括Exact， 缺出现Input，代码出错了
                            return {
                                status: 'Error',
                                error: 'Unexpected System Error',
                                errorDetail: 'Expect: ' + requiredType + ', ' + 'Get: ' + res.returnType,
                                location: curRoute + i
                            }
                        }
                    } else {                                // child非空
                        let satisfied = false
                        for (const childPossibleReturnType of res.returnType.split('/')) {
                            // 加减乘除或者根据index的returnType可能会返回多种可能        
                            if (requiredType.indexOf(childPossibleReturnType) !== -1) {  
                                // 只要其中一种可能满足，就通过    
                                satisfied = true
                            }
                        }
                        if (!satisfied) {
                            return {
                                status: 'Error',
                                error: 'Invalid Value Type',
                                errorDetail: 'Expect: ' + requiredType + ', ' + 'Get: ' + res.returnType,
                                location: curRoute + i
                            }
                        }
                    }
                    if (curReturnType === i - 1) {     // 数字表示根据index,根据现在遇到的child的return type
                        if (res.returnType === 'Empty' || res.returnType === 'Empty Input') {
                            // 如果child是空的，返回child type的所有可能
                            curReturnType = requiredType
                        } else {
                            curReturnType = res.returnType
                        }
                    }
                    if (curReturnType === '+-*/') {   
                        if (res.returnType === 'Number') { // 加减乘除 只要有一个Number就变成Number
                            curReturnType = res.returnType;
                        } else if (res.returnType === 'Exact Number') {
                            // 计算Exact Number个数，如果都是Exact Number， returnType会是Exact Number
                            exactNumberCounter += 1
                        }
                    }
                } else {
                    console.error('Unexpected error happened when ')
                }

            }
            if (curReturnType === '+-*/') {    // +-*/ 表示基础数学加减乘除, 有Number在上面循环中会改成Number
                if (exactNumberCounter === paramTypes.length) {// 如果都是Exact Number， returnType 是 Exact Number
                    curReturnType = 'Exact Number'
                } else if (hasEmptyChild || hasEmptyInput) {    
                    //没有Number，但有empty 或 Empty Input，那么Number,Integer, Exact Number都有可能
                    curReturnType = 'Number/Integer/Exact Number'
                } else {  // 没碰到Number， 全部填满了，又不是全部都是Exact，那么只可能是Integer，因为Integer + Exac = Integer Series
                    curReturnType = 'Integer';  //
                }
                
            }
            const res =  {
                status: 'Valid',
                returnType: curReturnType,
                location: curRoute
            }
            console.log(1111, res)
            return res
        }
        const res = helper('0', nestedCriterion[0]);
        if (res.status === 'Error') {
            return res
        }
        if (res.returnType === 'Empty') {
            return res
        }
        if (res.returnType.indexOf('Bool') === -1) {
            console.log(2222, res)
            return {
                status: 'Error',
                error: 'Invalid Value Type',
                errorDetail: 'Returned value type of a criterion function should be Boolean',
                location: res.location,
            }
        }
        return res
    }
    const checkEmpty = (nestedCriterion) => {
        const helper = (curRoute, nestedCriterion) => {
            if (nestedCriterion.length === 0) { // 存在empty
                return {
                    status: 'Error',
                    error: 'Empty',
                    errorDetail: 'Existing incomplete space',
                    location: curRoute
                }
            }
            if (nestedCriterion[0] === '') {    // Exact Number is not Entered
                return {
                    status: 'Error',
                    error: 'Empty Input',
                    errorDetail: 'Existing incomplete input space',
                    location: curRoute
                }
            }
            for (let i = 1; i < nestedCriterion.length; i++) {
                const res = helper(curRoute + 1, nestedCriterion[i]);
                if (res.status === 'Error') {
                    return res
                }
            }
            return {
                status: 'Valid',
            }
        }
        return helper('0', nestedCriterion[0]);
    }
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
            const { leadingText, paramTypes, joinChar, returnType } = itemInfo
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
                    if (i === returnType + 1) {
                        resReturnType = childRes.returnValueType;
                    }
                    resStr += childRes.criteriaStr;
                } else {
                    console.error('ERROR: Unexpected Status when check criterion at D:\\Coding_Study\\backtest_final\\backtest_web\\backtest_website\\src\\components\\home\\components\\content\\test\\components\\PositionOpen\\components\\CriteriaBuilder')
                }
            }
            resStr += ')';
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
        let checkRes = checkParamType(nestedBuilidingCriterion);
        if (checkRes.status === 'Error') {
            wanrInvalidCriterion(checkRes)
            return;
        }
        checkRes = checkEmpty(nestedBuilidingCriterion);
        if (checkRes.status === 'Error') {
            wanrInvalidCriterion(checkRes)
            return;
        }
        console.log(nestedBuilidingCriterion[0])
        const criterionStr = stringfyCriterion(nestedBuilidingCriterion[0]);
        if (criterionBeingEdited) { // editing
            console.log('Editing Criterion Click...', criterionBeingEdited)
            const { criterionId, } = criterionBeingEdited
            const { data } = await criterionService.updateCriterion(criterionId, userId, nameInputRef.current.input.value, criterionStr, nestedBuilidingCriterion)
            if (data.err_code === 0) {
                const { onFinishCallback, } = props
                if (onFinishCallback) {
                    onFinishCallback();
                } else {
                    PubSub.publish(onFinishMsg, { criteria: nestedBuilidingCriterion, criteriaStr: criterionStr })
                }
            } else {
                setCriterionNameExists(true)
            }
        } else {
            console.log('Adding Criterion Click..')
            const { data } = await criterionService.addCriterion(
                userId, nameInputRef.current.input.value, criterionStr, nestedBuilidingCriterion
            )
            if (data.err_code === 0) {
                PubSub.publish(onFinishMsg, { criteria: nestedBuilidingCriterion, criteriaStr: criterionStr })
            } else {
                setCriterionNameExists(true)
            }
        }
    }
    const handleForceClosingClick = () => {
        const { onForceCloseCallback, } = props
        if (onForceCloseCallback) {
            onForceCloseCallback();
            return
        }
        PubSub.publish(onFinishMsg, { forceClosing: true });
    }
    const getDeepcopyOfNestedCriterion = (nestedCriterion) => {
        return nestedCriterion.map((value, index) => { // 如果是空arr，会返回[], 如果是['price'], 会返回['price], 因为map必定用[]在外面包裹
            return index === 0 ? nestedCriterion[0] : getDeepcopyOfNestedCriterion(value);
        })
    }
    const replaceCriterionWithNestedCriterion = (nestedCriterion) => {
        const helper = (curRoute, curNestedCriterion) => {
            if (curRoute === curRouteOfSelectedBuildingCriterion) { // reach selected criterion, replace
                return getDeepcopyOfNestedCriterion(nestedCriterion);
            } else {
                return curNestedCriterion.map((value, index) => {
                    return index === 0 ? curNestedCriterion[0] : helper(curRoute + index, curNestedCriterion[index]);
                })
            }
        }
        const res = helper('0', nestedBuilidingCriterion[0]);
        return [res]
        setNestedBuildingCriterion([res]);
    }
    const replaceCriterionWithItemName = (replacingItemName) => {
        // replace the selected criterion in CriterionBuilder with the criterion clicked
        const helper = (curRoute, curNestedCriterion) => {
            if (curRoute === curRouteOfSelectedBuildingCriterion) { // reach selected criterion, replace
                const { paramTypes, } = itemDict[replacingItemName]
                return [replacingItemName]
                    .concat(paramTypes.map(paramType => {
                        console.log(paramType, paramTypes)
                        if (paramType.indexOf('Exact Number') >= 0) {
                            return ['']
                        } else {
                            return []
                        }
                    }));
            } else {
                return curNestedCriterion.map((value, index) => {   // 如果是空的arr, 会返回空的array
                    return index === 0 ? curNestedCriterion[0] : helper(curRoute + index, curNestedCriterion[index]);
                })
            }
        }
        const res = helper('0', nestedBuilidingCriterion[0]);
        return [res]
        setNestedBuildingCriterion([res]);
    }
    const wanrInvalidCriterion = (checkResult) => {     // warn
        setCurRouteOfSelectedBuildingCriterion(checkResult.location);
        setSelectedBuildingCriterionStatus('warning');
        setBuildingCriterionWarningMsg({ message: checkResult.error, description: checkResult.errorDetail });
    }
    const insertValidCriterion = (newCriterion) => {    // 不检查插入后是否正确
        setNestedBuildingCriterion(newCriterion);
        setSelectedBuildingCriterionStatus('edit');
        setBuildingCriterionWarningMsg(undefined);
    }
    const handleInsertCriterion = (insertedNestedCriterion) => {
        // receive: nested criterion
        // only validate paramtype, exclude empty error, 
        // insert if paramtype(including Exect Number(but excluding empty input '')) valid else warn
        const newCriterion = replaceCriterionWithNestedCriterion(insertedNestedCriterion);   // get criterion after insertion
        const typeCheckRes = checkParamType(newCriterion)
        if (typeCheckRes.status === 'Error') {
            wanrInvalidCriterion(typeCheckRes);
        } else {
            insertValidCriterion(newCriterion);
        }
    }
    const handleInsertCriterionWithName = (insertedCriterionName) => {
        const newCriterion = replaceCriterionWithItemName(insertedCriterionName);   // get criterion after insertion
        const typeCheckRes = checkParamType(newCriterion)
        if (typeCheckRes.status === 'Error') {
            wanrInvalidCriterion(typeCheckRes);
        } else {
            insertValidCriterion(newCriterion);
        }
    }
    const handleExactNumberInputChange = (value) => {
        const res = replaceCriterionWithNestedCriterion([value])
        setNestedBuildingCriterion(res)
    }
    const getRequiredReturnTypeOfSelected = () => {     // 
        if (curRouteOfSelectedBuildingCriterion === '') {
            console.error('No building criterion selected');
            return
        }
        const helper = (curRoute, nestedCriterion, curRequiredReturnType) => {
            if (curRoute === curRouteOfSelectedBuildingCriterion) {
                return curRequiredReturnType;
            }
            if (nestedCriterion.length === 0 || nestedCriterion[0] === '' || !isNaN(parseInt(nestedCriterion[0]))) { // 
                return undefined
            }
            const criterionName = nestedCriterion[0]
            const criterionInfo = itemDict[criterionName]
            const { paramTypes, } = criterionInfo
            for (let i = 1; i < nestedCriterion.length; i++) {
                const res = helper(curRoute + i, nestedCriterion[i], paramTypes[i - 1]);
                if (res) return res;
            }
            return undefined;
        }
        return helper('0', nestedBuilidingCriterion[0], 'Bool');
    }
    const handleClearSelected = () => {
        const requiredType = getRequiredReturnTypeOfSelected();
        const replaceItem = requiredType.indexOf('Exact Number') >= 0 ? [''] : []
        handleInsertCriterion(replaceItem);
    }
    useEffect(() => {
        const token1 = PubSub.subscribe(onCriterionItemClickMsg, (msg, data) => {
            if (curRouteOfSelectedBuildingCriterion === '') {
                message.warn('select the place in \'Current Criterion\'  you want to insert or replace')
            }
            const { item, } = data
            handleInsertCriterionWithName(item)
        });
        const token2 = PubSub.subscribe(onBuildingCriterionClickMsg, (msg, data) => {
            const { route, } = data
            setCurRouteOfSelectedBuildingCriterion(route);
            setSelectedBuildingCriterionStatus('edit');
        })
        return () => {
            PubSub.unsubscribe(token1);
        }
    })
    const handleNameInputKeyUp = (e) => {
        setCriterionNameExists(false);
    }

    return (
        <div>
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: '0',
                top: '0',
                zIndex: '1',
            }}>
            </div>
            <Draggable handle='.criteria-builder-handle'>
                <div style={{ zIndex: '2' }} className='criteria-builder-outer' >
                    <div className='criteria-builder-handle' >
                        &nbsp; Criteria Builder
                        <CloseOutlined onClick={handleForceClosingClick} style={{ float: 'right', marginTop: '4px', marginRight: '3px' }} />
                    </div>

                    <div className='criteria-builder-table-selector' ref={selectorTableRef}> {/* Item selector table*/}
                        <CascadeSelectorTable onCriterionItemClickMsg={onCriterionItemClickMsg} />
                    </div>

                    <br />
                    <div className='content-under-table-selector' >
                        <Space className='criteria-builder-criterion-builder'><span>Criterion Name: </span>
                            <Input status={criterionNameExists ? 'error' : ''} defaultValue={criterionBeingEdited ? criterionBeingEdited.criterionName : ''} onKeyUp={handleNameInputKeyUp} ref={nameInputRef} style={{ width: '150px', height: '30px' }} />
                            {criterionNameExists && <span style={{ color: 'red' }}>name exists</span>}
                        </Space>

                        <div> {/* Current Criteria*/}
                            <div><b>Current Criterion:</b></div>
                            <div style={{ marginTop: '1px', marginBottom: '10px' }} ref={criterionBuilderRef} >
                                {CriterionBuilder(nestedBuilidingCriterion[0], '0', curRouteOfSelectedBuildingCriterion, selectedBuildingCriterionStatus, itemDict, onBuildingCriterionClickMsg, 'Bool', handleExactNumberInputChange)}
                            </div>
                            <Space >
                                <span ref={saveTempCriterionButtonRef}>
                                    <button onClick={handleSaveToTemporaryCriterion} type='button'>Save to Temporary Items</button>
                                    <button onClick={handleClearSelected} type='button'>Clear Selected</button>
                                </span>
                            </Space>
                        </div>

                        <div> {/* Temporary Criteria*/}
                            <div><b>Temporary Items</b> (click to insert into current criterion) <b>:</b></div>
                            <div ref={temporaryCriterionTagsRef}>
                                {
                                    temporaryCriterionList.map(data => {
                                        const { id, criterionStr, nestedCriterion } = data
                                        return <Tag key={id} className='clickable-tag'
                                            closable
                                            onClose={(e) => { e.preventDefault(); onTemporaryCriterionDelete(id) }}
                                            onClick={() => { onTemporaryCriterionClick(nestedCriterion) }}
                                        >
                                            {criterionStr}
                                        </Tag>
                                    })
                                }
                            </div>
                        </div>
                        {selectedBuildingCriterionStatus === 'warning' && <Alert {...buildingCriterionWarningMsg} type="error" />}
                    </div>
                    <button style={{ position: 'absolute', right: '10%', bottom: '10%' }} onClick={handleFinishClick} ref={finishButtonRef} type='button'>Finish</button>
                </div>
            </Draggable>
        </div>

    )
}
