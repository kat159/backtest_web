
import React, { useEffect, useState } from 'react';
import { getData } from "./utils"

import { TypeChooser } from "react-stockcharts/lib/helper";
import CandleStickChart from './CandleStickChart';

export default function StockChart(props) {

    // const {indicators, stockSymbol} = props
    // 在criterionBuilder中，勾选variables作为line，必须是*不返回Bool的
    const stockSymbol = '600000'
    const indicators = [
        {
            id: 1,
            indicatorName: 'Volume',
            tickNum: 3,
            tickDemical: 2,
            variables: [

                {                   // LineSeries or BarSeries
                    name: 'Volume',
                    formula: 'VOLUME',
                    type: 'Bar',
                    colorSelector: data => data.close > data.open ? "#6BA583" : "red",  // Bar必须是Selector， Line必须color
                    data: [],        // **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
                    vairableTickDemical: 2,
                }
            ],
        },
        {
            id: 2,
            indicatorName: 'BLJJ',
            tickNum: 3,
            tickDemical: 2,
            variables: [
                {
                    name: 'BLJJ',
                    formula: 'BLJJ(CLOSE,HIGH,LOW)',
                    type: 'Line',
                    color: 'blue',
                    vairableTickDemical: 2,
                }
            ],
        },
        {
            id: 3,
            indicatorName: 'MACD',
            tickNum: 3,
            tickDemical: 2,
            variables: [
                {
                    name: 'MACD_SIGNAL',
                    formula: 'MACD_SIGNAL(CLOSE, 12, 26, 9)',
                    type: 'Line',
                    color: 'blue',
                    vairableTickDemical: 3,
                },
                {
                    name: 'MACD',
                    formula: 'MACD(CLOSE, 12, 26, 9)',
                    type: 'Line',
                    color: '#2ca02c',
                    vairableTickDemical: 3,
                },
            ]
        },
    ]
    const [symbol, setSymbol] = useState(stockSymbol)
    const [indicatorList, setIndicatorList] = useState(indicators)
    const [data, setData] = useState(undefined)


    useEffect(() => {
        getData({
            stockSymbol: symbol,
            indicators: indicatorList,  // **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
        }).then(data => {
            setData(data)
        })

        document.addEventListener('wheel',
            Event.preventDefault, { passive: false }
        )

        return () => {
            document.removeEventListener('wheel',
                Event.preventDefault, { passive: false }
            )
        }
    }, [])

    return (
        data === undefined ?
            <div>Loading...</div> :
            <TypeChooser>
                {type => <CandleStickChart indicators={indicatorList} type={type} data={data} />}
            </TypeChooser>
    )
}
