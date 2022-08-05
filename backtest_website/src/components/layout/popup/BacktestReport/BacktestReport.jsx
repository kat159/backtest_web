import { Button, Modal } from 'antd';
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
                message.success('Backtest Results Saved');
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
    return (
        <>
            {
                testReport === undefined ? <>Running test....</> :
                    <div>
                        <MetricsTable metrics={testReport.metrics} />
                        {/* <CapitalFlowChart handleChartValueClick={handleChartValueClick} date={testReport.date} capitalFlow={testReport.capitalFlow} /> */}
                        {capitalFlowChart}
                        {testReport.daily_test_report && <PositionStatusTable testReport={testReport} curIndex={clickedIndex} />}
                        <Button onClick={handleAddBacktestLog} >Save to Backtest Logs</Button>
                    </div>
            }
        </>
    );
}
