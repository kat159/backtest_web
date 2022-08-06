import { Button, Col, Divider, Modal, Row } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import backtestLogService from '../../../../services/backtestLogService';
import CapitalFlowChart from './CapitalFlowChart';
import MetricsTable from './MetricsTable';
import { message, Popconfirm, Input } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import strategyService from '../../../../services/strategyService';
import DraggablePoppup from '../DraggablePoppup';
import PositionOpen from '../../../strategy_builder/PositionOpen';
import PositionStatusTable from './PositionStatusTable';
import { nanoid } from 'nanoid';
import StockChart from '../stockChart/StockChart';
import { ResizableBox } from 'react-resizable';
import RisizableDraggablePoppup from '../RisizableDraggablePoppup';
import StockChartPopup from '../stockChart/StockChartPopup';

const { confirm } = Modal

export default function BacktestReport(props) {
    const { visible, setDisplayingReport, setTestReport, testReport, strategyId } = props
    // console.log(testReport)
    const { strategy } = testReport
    const [saveTimeCounter, setSaveTimeCounter] = useState(0);
    const handleAddBacktestLog = () => {
        if (saveTimeCounter > 0) {
            confirm({
                title: 'The test result has already been saved.'
            })
            return
        }
        if ((strategy === undefined || strategy.id === undefined) && strategyId === undefined) {
            confirm({
                title: 'You must Save the current tested strategy before saving the test result.',
                icon: <ExclamationCircleOutlined />,
                content: 'Would you like to save the current tested strategy?',
                async onOk() {
                    // console.log(strategy);
                    const res = await strategyService.addStrategy(strategy)
                    const { err_code, message } = res.data
                    if (err_code === 0) {
                        const { insertId } = res.data.results
                        setSaveTimeCounter(saveTimeCounter + 1)
                        saveBacktestLog({ ...testReport, strategyId: insertId });
                    } else {
                        confirm({
                            title: 'Strategy name exists.',
                        })
                    }

                },
                onCancel() {
                    // console.log('Cancel');
                },
            });
            return
        }
        setSaveTimeCounter(saveTimeCounter + 1)
        saveBacktestLog({ ...testReport, strategyId: strategy && strategy.id ? strategy.id : strategyId });
    }
    const saveBacktestLog = (data) => {
        backtestLogService.add(data).then(
            res => {
                message.success('Backtest Results Saved', 1);
            }
        )
    }
    const [clickedIndex, setClickedIndex] = useState(undefined);
    const handleChartValueClick = (index) => {
        setClickedIndex(index);
        console.log(index)
    }

    // **Better Not Use?? 'to prevent ONLY EXPENSIVE COMPUTATION, NOT to prevent re-render(may lead to bugs)'
    // 虽然每次setClickedIndex导致Chart的无谓更新，但是影响也不是很大，也就几千的数据
    const capitalFlowChart = useMemo(() => {
        return <CapitalFlowChart handleChartValueClick={handleChartValueClick} date={testReport.date} capitalFlow={testReport.capitalFlow} />
    }, [testReport.capitalFlow, testReport.date])

    const addKeyToDailyTestReport = useMemo(() => {
        const dailyReport = testReport.daily_test_report
        dailyReport.map(dailyData => {
            dailyData.cur_position_detail.map(data => {
                data.key = nanoid()
            });
            dailyData.position_change.map(data => {
                data.key = nanoid()
            })
        })
    }, [testReport.daily_test_report])

    const [symbolOfStockChart, setSymbolOfStockChart] = useState(undefined)
    const hanldeForceCloseStockChart = () => {
        setSymbolOfStockChart(undefined)
    }
    const handleOpenStockChart = (symbol) => {
        setSymbolOfStockChart(symbol);
    }

    return (
        <>
            {symbolOfStockChart &&
                <div
                    // onClick={(e)=>{e.preventDefault();}}   // 会stop child <a> from re-directing to the target url
                    onMouseOver={(e) => { e.preventDefault(); }}
                    onMouseLeave={(e) => { e.preventDefault(); }}
                    onMouseEnter={(e) => { e.preventDefault(); }}
                    onMouseOut={(e) => { e.preventDefault(); }}
                    // onWheel={(e) => {e.stopPropagation();}}  // **stopPropagation只能阻止自己的custom event，系统的event比如滚动，要用preventDefault，passive必须是false
                >
                    <StockChartPopup
                        testReport={testReport}
                        handleForceClosingClick={hanldeForceCloseStockChart}
                        content
                        stockSymbol={symbolOfStockChart}
                        title={<span>Stock Chart ( powered by <a target='_blank' href='https://github.com/rrag/react-stockcharts' > react-stockcharts</a> ) </span>}
                    />
                    {/* <RisizableDraggablePoppup
                        handleForceClosingClick={hanldeForceCloseStockChart}
                        content={
                            <StockChart
                                stockSymbol={symbolOfStockChart}
                            />
                        }
                        title={<span>Stock Chart ( powered by <a href='https://github.com/rrag/react-stockcharts' > react-stockcharts</a> ) </span>}
                    /> */}

                    {/* <DraggablePoppup
                        handleForceClosingClick={hanldeForceCloseStockChart}
                        content={
                            <StockChart
                                stockSymbol={symbolOfStockChart}
                            />
                        }
                        title={<span>Stock Chart ( powered by <a href='https://github.com/rrag/react-stockcharts' > react-stockcharts</a> ) </span>}
                    /> */}
                </div>
            }
            {
                testReport === undefined ? <>Running test....</> :
                    <div>
                        <Row>
                            <Col span={16} flex='0 1 1000px'
                            >
                                <div style={{
                                    minWidth: '500px',
                                    marginLeft: '2%'
                                }}>
                                    <MetricsTable metrics={testReport.metrics} />
                                    {/* <CapitalFlowChart handleChartValueClick={handleChartValueClick} date={testReport.date} capitalFlow={testReport.capitalFlow} /> */}
                                    {capitalFlowChart}
                                </div>

                            </Col>
                            <Col flex='1 1 '
                            >
                                <div style={{
                                    marginLeft: '2%',
                                    marginRight: '2%'
                                }}>
                                    {testReport.daily_test_report && <PositionStatusTable handleOpenStockChart={handleOpenStockChart} testReport={testReport} curIndex={clickedIndex} />}
                                </div>
                            </Col>
                            <Col />
                        </Row>
                        <Button type='dashed'
                            onClick={e => {
                                e.currentTarget.blur();
                                setTestReport(undefined);
                            }}
                            style={{ margin: '20px' }}
                        >Go Back</Button>
                        <Button type='dashed'
                            onClick={e => {
                                e.currentTarget.blur();
                                handleAddBacktestLog();
                            }}
                            style={{ margin: '20px' }}
                        >Save to Backtest Logs</Button>
                    </div>
            }
        </>
    );
}
