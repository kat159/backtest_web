
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import BuilderSelection from './components/BuilderSelection/BuilderSelection';
import ItemList from './components/ItemList/ItemList';
import PubSub from 'pubsub-js';

export default function CriteriaBuilder() {

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
        'Cross Above':          ['Cross',       ['Number', 'Number'],                   ', ',       'Bool',         []          ],
        'Cross Below':          ['CrossBelow',  ['Number', 'Number'],                   ', ',       'Bool',         []          ],
        'Lower Than':           ['',            ['Number', 'Number'],                   ' < ',      'Bool',         []          ],
        'Higher Than':          ['',            ['Number', 'Number'],                   ' > ',      'Bool',         []          ],
        'Equal To':             ['',            ['Number', 'Number'],                   ' = ',      'Bool',         []          ],
        // 'Volume':               ['VOLUME',      [],                                         '',     'Number',       []          ],
        'Highest':              ['HIGH',        [],                                         '',     'Number',       []          ],
        'Lowest':               ['LOW',         [],                                         '',     'Number',       []          ],
        'Close':                ['CLOSE',       [],                                         '',     'Number',       []          ],
        'Open':                 ['OPEN',        [],                                         '',     'Number',       []          ],
        'MA':                   ['MA',          ['Number', 'ExactNumber'],                  ', ',   'Number',       []          ],
        'MACD':                 ['MACD',        ['ExactNumber', 'ExactNumber', 'ExactNumber'],  ', ',   'Number',   [12, 26, 9] ],
    }

    const [itemsSelected, setItemsSelected] = useState([]);
    const [itemClicked, setItemClicked] = useState('');

    const [buildingCriterion, setBuildingCriterion] = useState([['Cross Above', ['Add', [], []], ['Cross Below', [], []]]]);
    const [routeToCurrentSelector, setRouteToCurrentSelector] = useState('');

    const onItemClicked = () => {
        if(routeToCurrentSelector !== '') { // 表示目前有选中
            console.log(itemClicked);
            updateRoute();
        }
    }

    ????没做完
    const updateRoute = () => {
        const newRoute = [];
        const deepCopy = (route, newRoute) => {
            if (route === []) {
                return [];
            }
            for (const nextRoute of route) {
                newRoute.push(updateRoute(nextRoute));
            }
        }
        

    }

    useEffect(() => {
        const token1 = PubSub.subscribe('criteria-selector-clicked', (msg, data) => {
            const {cur_route} = data;
            if(routeToCurrentSelector !== cur_route) {
                setRouteToCurrentSelector(cur_route);
            } else {
                setRouteToCurrentSelector('');
            }
        })
        return () => {
            PubSub.unsubscribe(token1);
        }
    })

    const createCriterionBuilder = (s, route) => {
        if (s.length === 0) {
            return <div key={nanoid()} style={
                        {
                            width: 'fit-content',
                            float: 'left',
                            display: 'inline-block',
                            borderColor: routeToCurrentSelector === route ? '#6f68ed' : 'gray',
                            borderWidth: routeToCurrentSelector === route ? '3px' : '0px',
                            borderStyle: 'solid',
                        }
                    } >
                <BuilderSelection cur_route={route} has_text="false" key={nanoid()} />
                </div>
        }
        const children = []
        for (let i = 1; i < s.length; i++) {
            if(i > 1) {
                children.push(<BuilderSelection cur_route={route} key={nanoid()} has_text="true">{','}&nbsp;</BuilderSelection>)
            }
            children.push(createCriterionBuilder(s[i], route+i));
        }

        return (
            <div key={nanoid()} style={
                {
                    width: 'fit-content',
                    float: 'left',
                    display: 'inline-block',
                    borderColor: routeToCurrentSelector === route ? '#6f68ed' : 'gray',
                    borderWidth: routeToCurrentSelector === route ? '3px' : '0px',
                    borderStyle: 'solid',
                }
            }>
                <BuilderSelection cur_route={route} key={nanoid()} has_text="true" >{s[0]}{'('}&nbsp;</BuilderSelection>
                {
                    children
                }
                <BuilderSelection cur_route={route} key={nanoid()} has_text="true" >&nbsp;{')'}</BuilderSelection>
            </div>
        )
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
                            <ItemList onItemClicked={onItemClicked} setItemClicked={setItemClicked} functionRules={functionRules} colNum={0} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col1Data} />
                            {itemsSelected[0] && col2Data[itemsSelected[0]] && <ItemList onItemClicked={onItemClicked} setItemClicked={setItemClicked} functionRules={functionRules} colNum={1} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col2Data[itemsSelected[0]]} />}
                            {itemsSelected[1] && col3Data[itemsSelected[1]] && <ItemList onItemClicked={onItemClicked} setItemClicked={setItemClicked} functionRules={functionRules} colNum={2} itemsSelected={itemsSelected} setItemsSelected={setItemsSelected} itemList={col3Data[itemsSelected[1]]} /> }
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
                
                {/* <BuilderSelection routeToCriterion='0' buildingCriterion={buildingCriterion} setBuildingCriterion={setBuildingCriterion} functionRules={functionRules} /> */}
            </div>
        </Draggable>
        
    )
}
