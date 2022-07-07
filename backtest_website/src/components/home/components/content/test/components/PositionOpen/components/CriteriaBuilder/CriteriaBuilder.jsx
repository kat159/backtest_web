
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import BuilderSelection from './components/BuilderSelection/BuilderSelection';
import ItemList from './components/ItemList/ItemList';
import PubSub from 'pubsub-js';

export default function CriteriaBuilder(props) {

    const col1Data = [
        ['Function', ''],
        ['Price', ''],
        // ['Volume', ''],
        ['Trend', ''],
        ['Oscillator', ''],
        ['Volatility', ''],
        ['Support/Resistance', ''],
    ]

    const col3Data = {
        'Math': [
            ['Add', ''],
            ['Minus', ''],
            ['Multiply', ''],
            ['Divide', '']
        ],
        'Reference': [
            ['REF', 'REF( A, B ) : return value of A at B days ago']
        ],
        'Logic': [
            ['Cross Above', ''],
            ['Cross Below', ''],
            ['Lower Than', ''],
            ['Higher Than', ''],
            ['Equal To', ''],
        ]
    }

    const col2Data = {
        'Function': [
            ['Math', 'Math'],
            ['Reference', 'Reference'],
            ['Logic', 'Logic'],
        ],
        // 'Volume': [
        //     ['VOL', 'Volume'],
        //     ['VR', 'Volume Ratio'],
        //     ['OBV', 'On-Balance Volume']
        // ],
        'Price': [
            ['Highest', 'Highest Price'],
            ['Lowest', 'Lowest Price'],
            ['Close', 'Closing Price'],
            ['Open', 'Opening Price']
        ],
        'Trend': [
            ['MA', 'Moving Average'],
            ['MACD', 'Moving Average Convergence Divergence'],
        ],
        'Oscillator': [
            ['CCI', 'Commodity Channel Index'],
            ['RSI', 'Relative Strength Index'],
        ],
        'Volatility': [
            ['BOLL', 'Bollinger Bands'],
            ['ATR', 'Average True Range'],

        ],
        'Support/Resistance': [

        ],
    }

    const functionRules = {
        // [leadingText, paramTypes, joinChar, returnValueType:['Bool', 'Number', 'indexDependingOn'], initialParams]
        'InitialBuilder':       ['',            ['Any'],                                   '',             0,       []          ],
        'Add':                  ['',            ['Number', 'Number'],                   ' + ',      'Number',       []          ],
        'Minus':                ['',            ['Number', 'Number'],                   ' - ',      'Number',       []          ],
        'Multiply':             ['',            ['Number', 'Number'],                   ' * ',      'Number',       []          ],
        'Divide':               ['',            ['Number', 'Number'],                   ' / ',      'Number',       []          ],
        'Cross Above':          ['CrossOver',   ['Number', 'Number'],                   ', ',       'Bool',         []          ],
        'Cross Below':          ['CrossBelow',  ['Number', 'Number'],                   ', ',       'Bool',         []          ],
        'Lower Than':           ['',            ['Number', 'Number'],                   ' < ',      'Bool',         []          ],
        'Higher Than':          ['',            ['Number', 'Number'],                   ' > ',      'Bool',         []          ],
        'Equal To':             ['',            ['Number', 'Number'],                   ' = ',      'Bool',         []          ],
        // 'Volume':               ['VOLUME',      [],                                         '',     'Number',       []          ],
        'Highest':              ['HIGH',        [],                                         '',     'Number',       []          ],
        'Lowest':               ['LOW',         [],                                         '',     'Number',       []          ],
        'Close':                ['CLOSE',       [],                                         '',     'Number',       []          ],
        'Open':                 ['OPEN',        [],                                         '',     'Number',       []          ],
        'MA':                   ['MA',          ['Number'],                                 ', ',   'Number',       []          ],
        'MACD':                 ['MACD',        [],                                         ', ',   'Number',   [12, 26, 9] ],
        'REF':                  ['REF',         ['Any', 'Number'],                              ', ',   0,          []          ],

    }

    const [itemsSelected, setItemsSelected] = useState([]);

    const [buildingCriterion, setBuildingCriterion] = useState([[]]);
    const [routeToCurrentSelector, setRouteToCurrentSelector] = useState('');
    const [isWarningForError, setIsWarningForError] = useState(false)

    const onItemClicked = (itemClicked) => {
        if(routeToCurrentSelector !== '') { // 表示目前有选中
            updateBuildingCriterion(itemClicked);
        }
    }

    const updateBuildingCriterion = (itemClicked) => {
        const deepCopy = (curCriterion, curRoute) => {
            const res = [];
            if (curRoute === routeToCurrentSelector) {
                const itemRule = functionRules[itemClicked];
                res.push(itemClicked);
                for (let i = 0; i < itemRule[1].length; i++) {
                    res.push([]);
                }
                return res;
            }
            if (curCriterion.length === 0) {
                return [];
            }
            res.push(curCriterion[0]);
            let counter = 1;
            
            for (const nextCriterion of curCriterion.slice(1)) {
                res.push(deepCopy(nextCriterion, curRoute + (counter++)));
            }
            return res
        }
        const newCriterion = [deepCopy(buildingCriterion[0], '0')];
        setBuildingCriterion(newCriterion);
    }

    useEffect(() => {
        const token1 = PubSub.subscribe('criteria-selector-clicked', (msg, data) => {
            const {cur_route} = data;
            setIsWarningForError(false);
            if(routeToCurrentSelector !== cur_route) {
                setRouteToCurrentSelector(cur_route);
            } else {
                setRouteToCurrentSelector('');  // 清空选中
            }
        })
        return () => {
            PubSub.unsubscribe(token1);
        }
    })

    const checkCriterion = () => {
        
        const helper = (curCriterion, curRoute) => {
            if (curCriterion.length === 0) {
                return {
                    status: 'Error',
                    error: 'Incomplete',
                    errorDetail: 'Existing incomplete space',
                    location: curRoute,
                }
            }

            let res = '';

            const criterionName = curCriterion[0];
            const rule = functionRules[criterionName]
            let [leadingText, paramTypes, joinChar, returnValueType] = rule
            if (paramTypes.length === 0) { // 到底了, 以后加入新元素比如ExactNumber，可能需要修改
                return {
                    status: 'Valid',
                    location: curRoute,
                    criteriaStr: leadingText,
                    returnValueType: returnValueType,
                }
            }

            const parenthesized = paramTypes.length > 0;
            let resReturnType = '';

            res += leadingText + (parenthesized ? '(' : '');

            for (let i = 1; i < curCriterion.length; i++) {
                if (i > 1) {
                    res += joinChar;
                }
                const childRes = helper(curCriterion[i], curRoute + i);
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
                    if (returnValueType !== 'Number' && returnValueType !== 'Bool' && i === returnValueType) {
                        resReturnType = childRes.returnValueType;
                    }
                    res += childRes.criteriaStr;
                } else {
                    console.error('ERROR: Unexpected Status when check criterion at D:\\Coding_Study\\backtest_final\\backtest_web\\backtest_website\\src\\components\\home\\components\\content\\test\\components\\PositionOpen\\components\\CriteriaBuilder')
                }
            }
            res += parenthesized ? ')' : '';
            return {
                status: 'Valid',
                location: curRoute,
                criteriaStr: res,
                returnValueType: resReturnType || returnValueType
            }
        }
        let res = helper(buildingCriterion[0], '0')
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

    /*
        **TODO
        Use e.stopPropagation() to prevent children triggering parent
        no need to seperate
    */
    const createCriterionBuilder = (curCriterion, route) => {
        if (curCriterion.length === 0) {
            return <div key={nanoid()} style={
                        {
                            width: 'fit-content',
                            float: 'left',
                            display: 'inline-block',
                            borderColor: routeToCurrentSelector === route && isWarningForError ? 'red' : routeToCurrentSelector === route ? '#6f68ed' : 'gray',
                            borderWidth: routeToCurrentSelector === route ? '3px' : '0px',
                            borderStyle: 'solid',
                        }
                    } >
                <BuilderSelection cur_route={route} has_text="false" key={nanoid()} />
                </div>
        }
        const criterionName = curCriterion[0];
        const rule = functionRules[criterionName]
        const [leadingText, paramTypes, joinChar] = rule
        const parenthesized = paramTypes.length > 0;

        const children = []
        for (let i = 1; i < curCriterion.length; i++) {
            if(i > 1) {
                children.push(<BuilderSelection cur_route={route} key={nanoid()} has_text="true">&nbsp;{joinChar}&nbsp;</BuilderSelection>)
            }
            children.push(createCriterionBuilder(curCriterion[i], route+i));
        }

        return (
            <div key={nanoid()} style={
                {
                    width: 'fit-content',
                    float: 'left',
                    display: 'inline-block',
                    borderColor: routeToCurrentSelector === route && isWarningForError ? 'red' : routeToCurrentSelector === route ? '#6f68ed' : 'gray',
                    borderWidth: routeToCurrentSelector === route ? '3px' : '0px',
                    borderStyle: 'solid',
                }
            }>
                <BuilderSelection cur_route={route} key={nanoid()} has_text="true" >{leadingText}{parenthesized && '('}&nbsp;</BuilderSelection>
                {
                    children
                }
                <BuilderSelection cur_route={route} key={nanoid()} has_text="true" >&nbsp;{parenthesized && ')'}</BuilderSelection>
            </div>
        )
    }

    const onFinishClick = () => {
        const res = checkCriterion();
        if(res.status === 'Error') {
            setRouteToCurrentSelector(res.location);
            setIsWarningForError(true)
            return ;
        }

        const {setIsBuildingCriteria, onFinishMsg} = props
        setIsBuildingCriteria(false);
        
        PubSub.publish(onFinishMsg, {criteria: buildingCriterion, criteriaStr: res.criteriaStr})
    }

    return (
        <Draggable handle='.handle' >
            <div style = {
                {
                    position: 'absolute',
                    zIndex: 0,
                    width: '80%',
                    height: '80%',
                    left: '10%',
                    top: '10%',
                    display: 'block',
                    backgroundColor: '#c4cbff', // #e6e9ff
                    border: '1px solid black',
                    padding: 1,
                }
            }>
                <div className="handle" style = {
                    {   
                        width: '100%',
                        height: '3%',
                        display: 'block',
                        backgroundColor: '#3b458a',
                        color: 'white'
                    }
                }>&nbsp; Criteria Builder
                </div>

                <table style={
                    {
                        display: 'block',
                        padding: '10px',
                        border: '1px solid black',
                    }
                }>  
                    <tbody>
                        <tr>
                            <ItemList onItemClicked={onItemClicked} functionRules={functionRules} colNum={0} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col1Data} />
                            {itemsSelected[0] && col2Data[itemsSelected[0]] && <ItemList onItemClicked={onItemClicked} functionRules={functionRules} colNum={1} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col2Data[itemsSelected[0]]} />}
                            {itemsSelected[1] && col3Data[itemsSelected[1]] && <ItemList onItemClicked={onItemClicked} functionRules={functionRules} colNum={2} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col3Data[itemsSelected[1]]} /> }
                        </tr>
                    </tbody>
                </table>

                <div>Current Criteria:</div>
                <div style={{
                    width: 'fit-content',
                    float: 'left',
                    display: 'inline-block'
                }}>
                    {createCriterionBuilder(buildingCriterion[0], '0')}
                </div>
                <br />
                <button onClick={onFinishClick} type='button' >Finish</button>
                {/* <BuilderSelection routeToCriterion='0' buildingCriterion={buildingCriterion} setBuildingCriterion={setBuildingCriterion} functionRules={functionRules} /> */}
            </div>
        </Draggable>
        
    )
}
