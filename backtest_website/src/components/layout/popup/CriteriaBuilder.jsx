import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import { CloseOutlined, EditOutlined, QuestionOutlined } from '@ant-design/icons'
import PubSub from 'pubsub-js';
import './CriteriaBuilder.css'
import CascadeSelectorTable from './CascadeSelectorTable/CascadeSelectorTable';
import criterionItemService from '../../../services/criterionItemService';
import CriterionBuilder from './CriterionBuilder/CriterionBuilder';
import { useRef } from 'react';
import { Alert, Input, Form, Space, message, Tag, Button } from 'antd';
import criterionService from '../../../services/criterionService';
import CriterionSearchSelector from '../../selector/CriterionSearchSelector';

export default function CriteriaBuilder(props) {
    const userId = localStorage.getItem('userId');
    const selectorTableRef = useRef(null)
    const criterionBuilderRef = useRef(null)
    const finishButtonRef = useRef(null)
    const saveTempCriterionButtonRef = useRef(null)
    const temporaryCriterionTagsRef = useRef(null)
    const alertMessageRef = useRef(null)
    const excludeClickOutsideRefs = [selectorTableRef, criterionBuilderRef, finishButtonRef, saveTempCriterionButtonRef, temporaryCriterionTagsRef, alertMessageRef]
    const handleClickOutside = event => {
        // console.log('Inner')
        event.stopPropagation()


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
            setBuildingCriterionWarningMsg(undefined);
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
    const descriptionInputRef = useRef(null);
    const { itemDict, } = criterionItemService.getAll()
    const { onFinishMsg, criterionBeingEdited } = props; // 告诉父组件criteria building complete
    const onCriterionItemClickMsg = 'criteria-builder-criterion-item-clicked' // CriteiaBuilder获得Table Selector点击的消息
    const onBuildingCriterionClickMsg = 'building-criterion-clicked'    // 获得builder的点击时间

    const [nestedBuilidingCriterion, setNestedBuildingCriterion] = useState([[]])
    //[['Cross Above', ['Plus', ['Opening Price'], ['Highest Price']], ['Closing Price']]]
    const [curRouteOfSelectedBuildingCriterion, setCurRouteOfSelectedBuildingCriterion] = useState('0')
    const [selectedBuildingCriterionStatus, setSelectedBuildingCriterionStatus] = useState('edit');
    const [buildingCriterionWarningMsg, setBuildingCriterionWarningMsg] = useState(undefined);
    const [criterionNameExists, setCriterionNameExists] = useState(false)

    // [{id, name, criterionStr, nestedCriterion, itemUsedCounter:{var1: 1, var2: 3} }], no dummy bracket
    const [temporaryCriterionList, setTemporaryCriterionList] = useState([]);
    const [temporaryCriterionNameError, setTemporaryCriterionNameError] = useState(undefined)

    const [autoValidating, setAutoValidating] = useState(true)
    const [toolTips, setToolTips] = useState(true)

    const finalCriterionId = '_F_i_N_a_L_#'// 识别是否是final
    const exactInputId = 'E_x_A_c_T_i_N_p_U_t#'     // 识别是否是exact input

    const [finalNestedCriterion, setFinalNestedCriterion] = useState([]);   // no dummy bracket

    // 打开edit状态的temp item set: undefined 或者 {id, name, nestedCriterion, route}
    const [editingCriterionId, setEditingCriterionId] = useState(undefined);
    // **TODO 7月26日： buiding criterion中 点击了icon，就把对应的id加入expanding set中，在criterionBuilder中遇到这个就展开，不遇到就只显示名字

    const [initialCriterion, setInitialCriterion] = useState(undefined);

    useEffect(() => {   // 初始化 criterion， 如果传入 criterionBeingEdited
        const { criterionBeingEdited, } = props
        const initializeCriterion = async () => {
            if (criterionBeingEdited) {
                const data = await criterionService.getCriterionById(criterionBeingEdited.criterionId);
                setInitialCriterion(data)
                const { criterion_arr, temporary_criterion_list, name } = data
                setTemporaryCriterionList(temporary_criterion_list)
                setFinalNestedCriterion(criterion_arr)
            }
        }
        initializeCriterion()
    }, [])

    const checkExactNumberInput = (nestedCriterion) => {
        const helper = (curRoute, nestedCriterion, requiredReturnType) => {
            // console.log(nestedCriterion) 
            if (nestedCriterion.length === 0) {     // 未填
                return {
                    status: 'Valid',
                    location: curRoute
                }
            }
            const itemName = nestedCriterion[0];
            if (isExactInput(itemName)) {
                const number = itemName.slice(exactInputId.length)
                if (!isNumeric(number)) {
                    return {
                        status: 'Error',
                        location: curRoute,
                        error: 'Invalid Number',
                        errorDetail: 'contains invalid input number: ' + number
                    }
                }
                if (!criterionService.canBeNumber(requiredReturnType)) {    // 必须是integer
                    if (number[0] === '0' || number[0] === '-' || number.indexOf('.') !== -1) {
                        return {
                            status: 'Error',
                            location: curRoute,
                            error: 'Invalid Number',
                            errorDetail: 'Expect: Positive Integer, Get: ' + number,
                        }
                    }
                }
                return {
                    status: 'Valid',
                    location: curRoute
                }
            }
            // console.log(itemName) 
            if (isTemporaryCriterion(itemName)) {  // temp item id
                const tempItem = getTemporaryCriterionById(itemName)
                // console.log(tempItem)
                return helper(curRoute, tempItem.nestedCriterion, requiredReturnType)
            }
            const itemInfo = itemDict[itemName];
            const { paramTypes, returnType } = itemInfo
            for (let i = 1; i < nestedCriterion.length; i++) {
                const res = helper(curRoute + i, nestedCriterion[i], paramTypes[i - 1]);
                const { status, returnType } = res
                if (status === 'Error') {
                    return res
                }
            }
            const res = {
                status: 'Valid',
                location: curRoute
            }
            return res
        }
        const res = helper('0', nestedCriterion[0], undefined);
        return res
    }
    const handleSaveToFinalCriterion = () => {
        const newCriterion = getDeepcopyOfNestedCriterion(nestedBuilidingCriterion[0]);
        if (validateCriterionEmpty([newCriterion]) && validateCriterionExactNumberInput([newCriterion])
            && validateCriterionParamType([newCriterion], finalCriterionId, 'Bool', true)
        ) {
            setFinalNestedCriterion(newCriterion)
            handleCancelEditingCriterion()
        }
    }
    const handleFinishEditingCriterion = () => {
        if (isTemporaryCriterion(editingCriterionId)) {
            const newCriterion = getDeepcopyOfNestedCriterion(nestedBuilidingCriterion[0]);
            const newData = temporaryCriterionList.map(item => {        // 改变自身name
                if (item.id === editingCriterionId) {
                    return { ...item, nestedCriterion: newCriterion }
                }
                return { ...item }
            })
            setTemporaryCriterionList(newData)
            handleCancelEditingCriterion()
        } else if (isFinalCriterionId(editingCriterionId)) {
            handleSaveToFinalCriterion()
        } else {
            console.error(`System error: id ${editingCriterionId} not found in [handleFinishEditingCriterion]`);
        }
    }
    const handleCancelEditingCriterion = () => {
        setCurRouteOfSelectedBuildingCriterion('0');
        setBuildingCriterionWarningMsg(undefined);
        setNestedBuildingCriterion([[]]);
        setEditingCriterionId(undefined);
        setSelectedBuildingCriterionStatus('edit');
    }
    const isFinalCriterionId = (id) => {
        return id === finalCriterionId
    }
    const handleCriterionEditClick = (itemId) => {
        // 取消cur criterion选中

        // 更新editing temp item状态
        setEditingCriterionId(itemId);
        // 更新Building Criterion
        let newBuildingCriterion
        if (itemId === finalCriterionId) {  // final
            newBuildingCriterion = [finalNestedCriterion]
        } else if (isTemporaryCriterion(itemId)) {  // temp item
            newBuildingCriterion = [getTemporaryCriterionById(itemId).nestedCriterion]
        } else {
            console.error('itemId not found in [handleCriterionEditClick]');
        }
        setSelectedBuildingCriterionStatus('edit');
        setBuildingCriterionWarningMsg(undefined);
        setCurRouteOfSelectedBuildingCriterion('0');
        setNestedBuildingCriterion(newBuildingCriterion);
    }
    const handleFinishEditing = () => {
        if (editingCriterionId === finalCriterionId) {  // save 到 final
            // check param 和 empty
            if (validateCriterionParamType(nestedBuilidingCriterion) && validateCriterionEmpty(nestedBuilidingCriterion)) {
                setFinalNestedCriterion(getDeepcopyOfNestedCriterion(nestedBuilidingCriterion[0]));
            }
        } else if (isTemporaryCriterion(editingCriterionId)) {  // save 到 temp item list
            const id = editingCriterionId
            const newData = temporaryCriterionList.map(item => {        // 改变自身name
                if (item.id === id) {
                    return { ...item, nestedCriterion: getDeepcopyOfNestedCriterion(nestedBuilidingCriterion[0]) }
                }
                return { ...item }
            })
            setTemporaryCriterionList(newData)
        } else {
            console.error('itemId not found in [handleFinishEditing]');
        }
    }
    const validateTemporaryCriterionName = (itemList, checkItemName = undefined, checkItemId = undefined) => {         // return true if no err, else return false and set warning
        if (checkItemName !== undefined && checkItemId !== undefined) {
            if (!checkItemName || checkItemName.length === 0) {
                setTemporaryCriterionNameError({
                    id: checkItemId,
                    error: 'Item name can not be empty.'
                })
                // document.getElementById(id).focus()
                return false
            }
            for (const item of itemList) {
                const { name, id } = item
                if (name === checkItemName && id !== checkItemId) {
                    setTemporaryCriterionNameError({
                        id: checkItemId,
                        error: 'Item name exists.'
                    })
                    // document.getElementById(id).focus()
                    return false
                }
            }
        } else {                                    // 没有给定checkItem
            const counter = {}
            for (const item of itemList) {
                const { name, id } = item
                if (!name || name.length === 0) {
                    setTemporaryCriterionNameError({
                        id: id,
                        error: 'Item name can not be empty.'
                    })
                    // document.getElementById(id).focus()
                    return false
                }
                counter[name] = counter[name] ? counter[name] + 1 : 1
                if (counter[name] > 1) {
                    setTemporaryCriterionNameError({
                        id: id,
                        error: 'Item name exists.'
                    })
                    // document.getElementById(id).focus()
                    return false
                }
            }
        }
        // valid
        setTemporaryCriterionNameError(undefined)
        return true
    }
    const onTemporaryCriterionNameInputBlur = (item) => {           // 保存temp item new name
        // console.log(temporaryCriterionNameError)
        const { name, id } = item
        const newData = temporaryCriterionList.map(item => {        // 改变自身name
            if (item.id === id) {
                return { ...item, name: name }
            }
            return { ...item }
        })
        setTemporaryCriterionList(newData)
        validateTemporaryCriterionName(newData, name, id) // 不要用state的数据，setState是异步，可能还没有set完成
    }
    const onTemporaryCriterionClick = (itemId) => {    // insert into building criterion
        if (curRouteOfSelectedBuildingCriterion === '') {   // 未选中要替换的
            message.warn('Selected the item you want to replace in \'Current Criterion\' ')
            return
        }
        handleInsertTemporaryCriterion(itemId);
    }
    const handleInsertTemporaryCriterion = (itemId) => {
        const item = getTemporaryCriterionById(itemId);   // get criterion after insertion
        if (item === undefined) {
            message.error('Unexpected error: item not found');
        }
        const { id, name, criterionStr, nestedCriterion } = item
        const newCriterion = replaceCriterionWithNestedCriterion([id])
        if (autoValidating) {
            if (validateCriterionParamType(newCriterion, editingCriterionId)) {         // **TODO: validate要算入item的情况，最后test的str要展开
                insertValidCriterion(newCriterion);
            }
        } else {
            insertValidCriterion(newCriterion);
        }
    }
    const isTemporaryCriterion = (itemId) => {
        return itemId.indexOf('tempItem#') >= 0
    }
    const getTemporaryCriterionById = (id) => {                 // 找不到返回undefined
        for (const item of temporaryCriterionList) {
            if (item.id === id) {
                return item
            }
        }
        return undefined
    }
    const onTemporaryCriterionDelete = (itemId) => {
        const removeFromNestedCriterion = (itemId, nestedCriterion) => {
            if (nestedCriterion.length > 0 && nestedCriterion[0] === itemId) {
                // item情况不能在map中判断， 因为['itemId']已经有一个元素，
                //    而用map返回，必然要返回length = 1 的array，而这里返回length = 0 的array
                return []
            }
            return nestedCriterion.map((value, index) => {
                // index > 0 的value必定是array
                return index !== 0 ? removeFromNestedCriterion(itemId, value) : value
            })
        }
        //从buildingCriterion中删掉
        const newBuildingCriterionList = removeFromNestedCriterion(itemId, nestedBuilidingCriterion[0]);

        const newData = temporaryCriterionList.filter(temporaryCriterion => {       // 删掉这个item
            return temporaryCriterion.id !== itemId;
        })

        const newTemporaryCriterionList = []
        for (const tempItem of newData) {                                           // 从所有temp item中删掉item
            const newItem = { ...tempItem, nestedCriterion: removeFromNestedCriterion(itemId, tempItem.nestedCriterion) }
            newTemporaryCriterionList.push(newItem)
        }

        const newFinalCriterion = removeFromNestedCriterion(itemId, finalNestedCriterion);

        if (itemId === editingCriterionId) {
            setEditingCriterionId(undefined);
        }
        setFinalNestedCriterion(newFinalCriterion);
        setNestedBuildingCriterion([newBuildingCriterionList]);
        setTemporaryCriterionList(newTemporaryCriterionList);
    }
    const reloadBuildingCriterion = () => {                     // temp item 改名或者删除后，重新改变buildingcriterion

    }
    const handleSaveToTemporaryCriterion = () => { // button click
        if (curRouteOfSelectedBuildingCriterion === '') {
            message.warn('Selected the item in \'Current Criterion\' that you want to save')
            return
        }
        const nestedCriterion = getCurSelectedBuildingCriterion()
        const criterionStr = stringfyCriterion(nestedCriterion);
        let name = ''
        for (let i = 1; i < 100; i++) {  // look for available default name
            const expectName = 'var' + i
            let exist = false
            for (const item of temporaryCriterionList) {
                const { name, } = item
                if (expectName === name) {
                    exist = true
                    break
                }
            }
            if (!exist) {
                name = expectName
                break
            }
        }
        const newId = 'tempItem#' + nanoid()
        const newData = [...temporaryCriterionList, { id: newId, name: name, criterionStr: criterionStr, nestedCriterion: nestedCriterion }]
        // await setTemporaryCriterionList(newData);    // **setState后面不要用await，await只对返回promise的有效，setState不返回promise 有效也只是巧合！！
        setTemporaryCriterionList(newData);
    }
    const isExactInput = (value) => {
        return value.indexOf(exactInputId) >= 0
    }
    const stringfyCriterion = (nestedCriterion, expandTempItem = false) => {  // no validity check, replace empty array with __
        const helper = (curNestedCriterion) => {
            if (curNestedCriterion.length === 0) { // 有未填的空
                return '__';
            }
            if (curNestedCriterion[0] === '') {     // unfilled Exact Number
                return '__';
            }
            if (isExactInput(curNestedCriterion[0])) {  // Exact Number
                return curNestedCriterion[0].slice(exactInputId.length)
            }
            if (isTemporaryCriterion(curNestedCriterion[0])) {  // temp item id
                // console.log('id:', curNestedCriterion[0])
                // console.log(temporaryCriterionList)
                const tempItem = getTemporaryCriterionById(curNestedCriterion[0])
                if (expandTempItem) {
                    return helper(tempItem.nestedCriterion)
                }
                return tempItem.name
            }
            const itemName = curNestedCriterion[0];
            // console.log(itemName) 
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
    const checkParamType = (nestedCriterion, forbiddenId = undefined, finalType = undefined, checkExactInput = false) => {    // only check type and **self-reference, exclude empty error , need **additional bracket
        // forbiddenId，用于防止self-reference, 如果正在edit或准备保存到var1，那么递归结构item的时候就不能碰到var1的id
        const helper = (curRoute, nestedCriterion) => {
            if (nestedCriterion.length === 0) {     // 未填
                return {
                    status: 'Valid',
                    returnType: 'Empty',
                    location: curRoute
                }
            }
            const itemName = nestedCriterion[0];
            if (itemName === '') {                 // 空的Input框
                return {
                    status: 'Valid',
                    returnType: 'Empty Input',
                    location: curRoute
                }
            }
            if (isExactInput(itemName)) {  // Exact Number 的input框
                // 注意** 没有检查input empty， input必须有数字，在checkEmpty中要查
                return {
                    status: 'Valid',
                    returnType: 'Exact Number',     // 返回Exact
                    location: curRoute,
                    value: itemName.slice(exactInputId.length)
                }
            }
            if (isTemporaryCriterion(itemName)) {   // itemName is temp criterion id
                if (forbiddenId !== undefined && itemName === forbiddenId) {    // ERROR: self reference, 
                    return {
                        status: 'Error',
                        error: 'Self Reference Error',
                        errorDetail: getTemporaryCriterionById(itemName).name + ' is referencing itself.',
                        location: curRoute
                    }
                }
                const item = getTemporaryCriterionById(itemName)
                return helper(curRoute, item.nestedCriterion)
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
                        // 检查exact input
                        if (checkExactInput && res.returnType === 'Exact Number') {
                            const number = res.value
                            if (!isNumeric(number)) {
                                return {
                                    status: 'Error',
                                    location: curRoute,
                                    error: 'Invalid Number',
                                    errorDetail: 'contains invalid input number: ' + number
                                }
                            }
                            if (!criterionService.canBeNumber(requiredType)) {    // 必须是integer
                                if (number[0] === '0' || number[0] === '-' || parseFloat(number).toFixed() - parseFloat(number) >= 1e-6) {
                                    return {
                                        status: 'Error',
                                        location: curRoute,
                                        error: 'Invalid Number',
                                        errorDetail: 'Expect: Positive Integer, Get: ' + number,
                                    }
                                }
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
            var curExactNumberValue = undefined;
            if (curReturnType === '+-*/') {    // +-*/ 表示基础数学加减乘除, 有Number在上面循环中会改成Number
                if (exactNumberCounter === paramTypes.length) {// 如果都是Exact Number， returnType 是 Exact Number
                    curReturnType = 'Exact Number'
                    var num1 = nestedCriterion[1][0].slice(exactInputId.length)
                    var num2 = nestedCriterion[2][0].slice(exactInputId.length)
                    curExactNumberValue = (parseFloat(num1) + parseFloat(num2)).toString()
                } else if (hasEmptyChild || hasEmptyInput) {
                    //没有Number，但有empty 或 Empty Input，那么Number,Integer, Exact Number都有可能
                    curReturnType = 'Number/Integer/Exact Number'
                } else {  // 没碰到Number， 全部填满了，又不是全部都是Exact，那么只可能是Integer，因为Integer + Exac = Integer Series
                    curReturnType = 'Integer';  //
                    var num1 = nestedCriterion[1][0].slice(exactInputId.length)
                    var num2 = nestedCriterion[2][0].slice(exactInputId.length)
                    // Todo: num1, num2可能是float，之前假设exact input必须是integer，现在可以是float
                }
            }
            const res = {
                status: 'Valid',
                returnType: curReturnType,
                location: curRoute,
                value: curExactNumberValue
            }
            return res
        }
        const res = helper('0', nestedCriterion[0]);
        if (res.status === 'Error') {
            return res
        }
        if (res.returnType === 'Empty') {
            return res
        }
        if (finalType && res.returnType.indexOf(finalType) === -1) {
            return {
                status: 'Error',
                error: 'Invalid Value Type',
                errorDetail: 'Returned value type of the final criterion must be Boolean, but received: ' + res.returnType,
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
            if (isExactInput(nestedCriterion[0]) && nestedCriterion[0].slice(exactInputId.length) === '') {    // Exact Number is not Entered
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
    const handleFinishClick = async () => {                 // check , then save or add
        // if (!validateCriterionParamType([finalNestedCriterion], finalCriterionId, 'Bool')) {
        //     return
        // }

        // let checkRes = checkEmpty([finalNestedCriterion]);
        // if (checkRes.status === 'Error') {
        //     wanrInvalidCriterion(checkRes)
        //     return;
        // }

        let checkRes = checkParamType([finalNestedCriterion], finalCriterionId, 'Bool');
        if (checkRes.status === 'Error') {
            setBuildingCriterionWarningMsg({
                message: checkRes.error + ' found in Final Criterion',
                description: checkRes.errorDetail
            });
            return;
        }
        checkRes = checkEmpty([finalNestedCriterion]);
        // console.log(checkRes)
        if (checkRes.status === 'Error') {
            setBuildingCriterionWarningMsg({
                message: checkRes.error + ' found in Final Criterion',
                description: checkRes.errorDetail
            });
            return;
        }

        const criterionStr = stringfyCriterion(finalNestedCriterion);
        if (criterionBeingEdited) { // editing
            // console.log('Editing Criterion Click...', criterionBeingEdited)
            const { criterionId, } = criterionBeingEdited
            const { data } = await criterionService.updateCriterion(
                criterionId, userId, nameInputRef.current.input.value,
                criterionStr, finalNestedCriterion, temporaryCriterionList,
                descriptionInputRef.current.resizableTextArea.textArea.value
            )
            if (data.err_code === 0) {
                const { onFinishCallback, } = props
                if (onFinishCallback) {
                    onFinishCallback();
                } else {
                    PubSub.publish(onFinishMsg, { criteria: finalNestedCriterion, criteriaStr: criterionStr, temporaryCriterionList: temporaryCriterionList })
                }
            } else {
                setCriterionNameExists(true)
            }
        } else {
            // console.log('Adding Criterion Click..')
            const { data } = await criterionService.addCriterion(
                userId, nameInputRef.current.input.value, criterionStr,
                finalNestedCriterion, temporaryCriterionList,
                descriptionInputRef.current.resizableTextArea.textArea.value
            )
            if (data.err_code === 0) {
                PubSub.publish(onFinishMsg, { criteria: finalNestedCriterion, criteriaStr: criterionStr, temporaryCriterionList: temporaryCriterionList })
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
                        if (paramType.indexOf('Exact Number') >= 0) {
                            return [exactInputId]
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
        if (autoValidating) {
            if (validateCriterionParamType(newCriterion)) {
                insertValidCriterion(newCriterion);
            }
        } else {
            insertValidCriterion(newCriterion);
        }
        // const typeCheckRes = checkParamType(newCriterion)
        // if (typeCheckRes.status === 'Error') {
        //     wanrInvalidCriterion(typeCheckRes);
        // } else {
        //     insertValidCriterion(newCriterion);
        // }
    }
    const handleInsertCriterionWithName = (insertedCriterionName) => {
        const newCriterion = replaceCriterionWithItemName(insertedCriterionName);   // get criterion after insertion
        if (autoValidating) {
            if (validateCriterionParamType(newCriterion)) {
                insertValidCriterion(newCriterion);
            }
        } else {
            insertValidCriterion(newCriterion);
        }
        // const typeCheckRes = checkParamType(newCriterion)
        // if (typeCheckRes.status === 'Error') {
        //     wanrInvalidCriterion(typeCheckRes);
        // } else {
        //     insertValidCriterion(newCriterion);
        // }
    }
    const isNumeric = (str) => {
        // 注意 1e3 会是true，但是input限制了字母，所以没事
        if (typeof str != "string") return false // we only process strings!  
        if (str.length === 0) return false
        if (str[0] === '0' && str.length === 1) return false
        if (str[0] === '0' && str.length > 1 && str[1] !== '.') return false
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }
    const handleExactNumberInputChange = (value, requiredType) => {
        // const canBeNumber = requiredType.indexOf('Number') !== -1
        const canBeNumber = criterionService.canBeNumber(requiredType);
        if (value.length > 0) {
            if (!canBeNumber && (value[0] === '0' || value[0] === '-' || value.indexOf('.') !== -1)) {
                message.error('Must be positive integer.')
                setNestedBuildingCriterion([...nestedBuilidingCriterion])
                setSelectedBuildingCriterionStatus('warning')
                return
            }
            if (!isNumeric(value)) {
                // message.error('Invalid value.')
                setSelectedBuildingCriterionStatus('warning')
                const res = replaceCriterionWithNestedCriterion([exactInputId + value])
                setNestedBuildingCriterion(res)
                return
            }
        }
        setSelectedBuildingCriterionStatus('edit')
        const res = replaceCriterionWithNestedCriterion([exactInputId + value])
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
            if (nestedCriterion.length === 0) { // 
                return undefined
            }
            if (nestedCriterion[0] === '' || isExactInput(nestedCriterion[0])) {
                // empty和input如果是selected route在上面就会退出
                // 如果不是selected route，返回undefined，而不是Exact Number，
                // 返回的是parent给定的参数类型，可能为多个
                // return 'Exact Number'    # 错误，// 返回的是parent给定的参数类型，可能为多个
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
        const replaceItem = requiredType.indexOf('Exact Number') >= 0 ? [exactInputId] : []
        handleInsertCriterion(replaceItem);
    }
    useEffect(() => {
        const token1 = PubSub.subscribe(onCriterionItemClickMsg, (msg, data) => {
            if (curRouteOfSelectedBuildingCriterion === '') {
                message.warn('select the place in \'Current Criterion\'  you want to insert or replace')
            } else {
                const { item, } = data
                handleInsertCriterionWithName(item)
            }
        });
        const token2 = PubSub.subscribe(onBuildingCriterionClickMsg, (msg, data) => {
            const { route, } = data
            setCurRouteOfSelectedBuildingCriterion(route);
            setSelectedBuildingCriterionStatus('edit');
            setBuildingCriterionWarningMsg(undefined);
        })
        return () => {
            PubSub.unsubscribe(token1);
            PubSub.unsubscribe(token2);
        }
    })
    const handleNameInputKeyUp = (e) => {
        setCriterionNameExists(false);
    }
    const validateCriterionParamType = (nestedCriterion, forbiddenId = undefined, finalType = undefined, checkExactInput=false) => {  //不检查empty和empty input， paramType就报错, 
        // Return: True if valid else false
        // forbiddenId: used for check self-reference
        const res = checkParamType(nestedCriterion, forbiddenId, finalType, checkExactInput) // checkParamType要用[]外层包裹
        if (res.status === 'Error') {
            wanrInvalidCriterion(res);
            return false
        } else {
            return true
        }
    }
    const validateCriterionEmpty = nestedCriterion => {
        let checkRes = checkEmpty(nestedCriterion);
        if (checkRes.status === 'Error') {
            wanrInvalidCriterion(checkRes)
            return false
        }
        return true
    }
    const validateCriterionExactNumberInput = nestedCriterion => {
        let checkRes = checkExactNumberInput(nestedCriterion);
        if (checkRes.status === 'Error') {
            wanrInvalidCriterion(checkRes)
            return false
        }
        return true
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
                        <CascadeSelectorTable toolTips={toolTips} onCriterionItemClickMsg={onCriterionItemClickMsg} />
                    </div>

                    <br />
                    <div className='content-under-table-selector' >
                        <Space className='criteria-builder-criterion-builder'><span>Criterion Name: </span>
                            <Input status={criterionNameExists ? 'error' : ''} defaultValue={criterionBeingEdited ? criterionBeingEdited.criterionName : ''} onKeyUp={handleNameInputKeyUp} ref={nameInputRef} style={{ width: '150px', height: '30px' }} />
                            {criterionNameExists && <span style={{ color: 'red' }}>name exists</span>}
                        </Space>
                        <Space style={{ marginLeft: '23px' }} className='criteria-builder-criterion-builder'>
                            <span>Description: </span>
                            <Input.TextArea
                                onFocus={(e) => {
                                    e.stopPropagation(); e.preventDefault();
                                    e.currentTarget.style.height = '50px'
                                }}
                                onBlur={(e) => {
                                    e.stopPropagation(); e.preventDefault();
                                    e.currentTarget.style.height = '20px'
                                }}

                                maxLength={100}
                                defaultValue={criterionBeingEdited ? criterionBeingEdited.description : ''}
                                ref={descriptionInputRef}
                                style={{
                                    width: '250px',
                                    height: '20px',
                                }}
                            />
                        </Space>

                        <div><span style={{ color: 'red' }}>* </span><b>Final Criterion:</b></div>
                        <div>
                            {stringfyCriterion(finalNestedCriterion)}
                            <EditOutlined className='my-action-tag'
                                style={{
                                    fontSize: '10px',
                                    marginLeft: '10px'
                                }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCriterionEditClick(finalCriterionId)
                                }} />
                        </div>

                        <div> {/* Current Criteria*/}
                            <div><b>Criterion Builder </b> (
                                {!editingCriterionId ? 'unSaved' :
                                    'editing ' +
                                    (isTemporaryCriterion(editingCriterionId) ?
                                        getTemporaryCriterionById(editingCriterionId).name :
                                        'final criterion')}
                                )
                                <b> : </b>
                                <Space>

                                </Space>
                            </div>
                            <div style={{ marginTop: '1px', marginBottom: '10px' }} ref={criterionBuilderRef} >
                                {CriterionBuilder(nestedBuilidingCriterion[0], '0',
                                    curRouteOfSelectedBuildingCriterion,
                                    selectedBuildingCriterionStatus,
                                    itemDict,
                                    onBuildingCriterionClickMsg,
                                    'Bool',
                                    handleExactNumberInputChange,
                                    temporaryCriterionList,
                                    toolTips,
                                    handleClearSelected,
                                )}
                            </div>

                            <span ref={saveTempCriterionButtonRef}>
                                <Space>
                                    {editingCriterionId &&
                                        <Button className='criterion-builder-button'
                                            type='button'
                                            onClick={(e) => {
                                                e.currentTarget.blur()
                                                handleFinishEditingCriterion()
                                            }}
                                            style={{
                                                padding: '1px 5px 1px 5px',
                                                height: '30px'
                                            }}

                                        >Finish</Button>
                                    }
                                    {editingCriterionId &&
                                        <Button className='criterion-builder-button'
                                            type='button'
                                            onClick={(e) => {
                                                e.currentTarget.blur()
                                                handleCancelEditingCriterion()
                                            }}
                                            style={{
                                                padding: '1px 5px 1px 5px',
                                                height: '30px'
                                            }}
                                        >Cancel</Button>
                                    }
                                    <Button onClick={(e) => {
                                        e.currentTarget.blur()
                                        handleSaveToTemporaryCriterion()
                                    }}
                                        type='button'
                                        className='criterion-builder-button'
                                        style={{
                                            padding: '1px 5px 1px 5px',
                                            height: '30px'
                                        }}
                                    >Save as new variable</Button>
                                    {/* <button onClick={handleClearSelected} type='button'>Clear</button> */}
                                    <Button onClick={(e) => {
                                        e.currentTarget.blur()
                                        handleSaveToFinalCriterion()
                                    }}
                                        type='button'
                                        className='criterion-builder-button'
                                        style={{
                                            padding: '1px 5px 1px 5px',
                                            height: '30px'
                                        }}
                                    >Save as final criterion</Button>
                                </Space>
                                {/* <button onClick={() => { validateCriterionParamType(nestedBuilidingCriterion, editingCriterionId) }} type='button'>Validate</button> */}
                                <div >
                                    <input checked={toolTips} style={{ cursor: 'pointer' }} onChange={() => { setToolTips(!toolTips);}} type="checkbox" />
                                    &nbsp;tool tips
                                </div>

                            </span>
                        </div>

                        <div> {/* Temporary Criteria*/}
                            <div><b>Variables</b> (click to insert into current criterion) <b>:</b></div>
                            <div ref={temporaryCriterionTagsRef}>
                                {
                                    temporaryCriterionList.map(data => {
                                        const { id, name, criterionStr, nestedCriterion } = data
                                        return <div className='temporary-item' key={id}>
                                            <span id={id} className='temporary-item-name-input' contentEditable={true}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) => {
                                                    onTemporaryCriterionNameInputBlur({ ...data, name: e.currentTarget.textContent })
                                                }}
                                                style={{
                                                    border: temporaryCriterionNameError && temporaryCriterionNameError.id === id ? 'solid' : '',
                                                    borderColor: temporaryCriterionNameError && temporaryCriterionNameError.id === id ? 'red' : '',
                                                    borderWidth: temporaryCriterionNameError && temporaryCriterionNameError.id === id ? '2px' : '',
                                                }}
                                            >
                                                {name}
                                            </span>
                                            <EditOutlined className='my-action-tag' style={{ fontSize: '10px' }} onClick={() => {
                                                document.getElementById(id).focus()
                                            }} />
                                            : &nbsp;
                                            <Tag className='clickable-tag'

                                                closable
                                                onClose={(e) => { e.preventDefault(); onTemporaryCriterionDelete(id) }}
                                                onClick={() => { onTemporaryCriterionClick(id) }}
                                            >
                                                {/* **不能用Str， 要依赖nestedCriterion，否则就算nestedCriterion变了， str也不会变 */}
                                                {/* {criterionStr} */}
                                                {stringfyCriterion(nestedCriterion)}

                                                <EditOutlined className='my-action-tag'
                                                    style={{
                                                        fontSize: '10px',
                                                        marginLeft: '10px'
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleCriterionEditClick(id)
                                                    }} />
                                            </Tag>
                                            {temporaryCriterionNameError && temporaryCriterionNameError.id === id && <div style={{ color: 'red' }} >{temporaryCriterionNameError.error}</div>}
                                        </div>

                                    })
                                }
                            </div>
                        </div>
                        <div ref={alertMessageRef}>
                            {buildingCriterionWarningMsg && <Alert {...buildingCriterionWarningMsg} type="error" />}
                        </div>

                    </div>
                    <Space size={'large'} style={{ position: 'absolute', right: '3%', bottom: '10%' }}>
                        <Button
                            onClick={e => {
                                e.currentTarget.blur()
                                handleFinishClick()
                            }}
                            ref={finishButtonRef}
                            className='criterion-builder-button'
                            type='button'
                        >Finish</Button>
                        <Button onClick={handleForceClosingClick} type='button' className='criterion-builder-button'
                        >Cancel</Button>
                    </Space>

                </div>
            </Draggable>
        </div>

    )
}
