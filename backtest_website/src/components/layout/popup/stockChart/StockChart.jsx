
import React, { useEffect, useState } from 'react';
import { getData } from "./utils"

import { TypeChooser } from "react-stockcharts/lib/helper";
import CandleStickChart from './CandleStickChart';
import { Button, Space } from 'antd'
import { SettingOutlined } from '@ant-design/icons';
import { symbol } from 'prop-types';

export default function StockChart(props) {

    // const {indicators, stockSymbol} = props
    // 在criterionBuilder中，勾选variables作为line，必须是*不返回Bool的
    const { stockSymbol, chartWidth, chartHeight, testReport } = props
    // const stockSymbol = '600000'
    const indicators = [
        {
            id: 2,
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
            id: 3,
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
            id: 4,
            indicatorName: 'MACD',
            tickNum: 3,
            tickDemical: 2,
            variables: [
                {
                    name: 'MACD_SIGNAL',
                    formula: 'MACD_SIGNAL(CLOSE, 12, 26, 9)',
                    type: 'Line',
                    color: 'blue',
                    vairableTickDemical: 2,
                },
                {
                    name: 'MACD',
                    formula: 'MACD(CLOSE, 12, 26, 9)',
                    type: 'Line',
                    color: '#2ca02c',
                    vairableTickDemical: 2,
                },
            ]
        },
    ]
    // const [symbol, setSymbol] = useState(stockSymbol)
    const [indicatorList, setIndicatorList] = useState(indicators)
    const [data, setData] = useState(undefined)
    const trackChartSetting = {
        id: 1,
        indicatorName: 'Stock Tracking',
        tickNum: 3,
        tickDemical: 2,
        variables: [
            {                   // LineSeries or BarSeries
                name: 'Net Accum Return',
                formula: 'netAccumReturn',
                type: 'Line',
                color: '#2ca02c',  // Bar必须是Selector， Line必须color
                data: [],        // **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
                vairableTickDemical: 2,
            },
            {                   // LineSeries or BarSeries
                name: 'Holing Amount',
                formula: 'holdingAmount',
                type: 'Bar',
                colorSelector: data => data.close > data.open ? "#6BA583" : "red",  // Bar必须是Selector， Line必须color
                data: [],        // **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
                vairableTickDemical: 2,
            },
        ],
    }
    useEffect(() => {
        // console.log(testReport.daily_test_report)
        setData(undefined)
        getData({
            dailyTestReport: testReport.daily_test_report,
            trackChartSetting: trackChartSetting,
            stockSymbol: stockSymbol,
            indicators: indicatorList,  // **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
        }).then(data => {
            // console.log(data)
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
    }, [stockSymbol,])

    return (
        <div>
            {/* TODO: set indicators charts */}
            <Space>
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>
                    <Button disabled size='small' type='link' ><SettingOutlined /> Setting </Button>
                </div>
                <div style={{ marginLeft: '10px', marginTop: '5px' }}>Symbol: {stockSymbol}</div>
            </Space>

            {
                data === undefined ?
                    <div>Loading...</div> :
                    <CandleStickChart stockSymbol={stockSymbol} chartHeight={chartHeight} indicators={[trackChartSetting, ...indicatorList, ]} data={data} />
                // <TypeChooser>
                //     {type =>
                //         <CandleStickChart stockSymbol={stockSymbol} chartHeight={chartHeight} indicators={indicatorList} type={type} data={data} />
                //     }
                // </TypeChooser>
            }
        </div>

    )
}
