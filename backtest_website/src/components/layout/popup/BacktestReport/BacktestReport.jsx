import { Button, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import backtestLogService from '../../../../services/backtestLogService';
import CapitalFlowChart from './CapitalFlowChart';
import MetricsTable from './MetricsTable';
import { message, Popconfirm, Input } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import strategyService from '../../../../services/strategyService';

const { confirm } = Modal

export default function BacktestReport(props) {
    const { visible, setDisplayingReport, setTestReport, testReport, strategyId } = props
    const { strategy } = testReport
    console.log(testReport, strategyId);
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
                    console.log(strategy);
                    const res = await strategyService.addStrategy(strategy)
                    const {err_code, message} = res.data
                    if (err_code === 0) {
                        const {insertId} = res.data.results
                        setSaveTimeCounter(saveTimeCounter + 1)
                        saveBacktestLog({ ...testReport, strategyId: insertId});
                    } else {
                        confirm({
                            title: 'Strategy name exists.',
                        })
                    }
                    
                },
                onCancel() {
                    console.log('Cancel');
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

    const [disabled, setDisabled] = useState(false);
    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });
    const draggleRef = useRef(null);

    const handleOk = (e) => {
        setDisplayingReport(false);
        setTestReport(undefined);
    };

    const handleCancel = (e) => {
        setDisplayingReport(false);
        setTestReport(undefined);
    };

    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();

        if (!targetRect) {
            return;
        }

        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    return (
        <>
            <Modal
                title={
                    <div
                        style={{
                            width: '90%',
                            cursor: 'move',
                        }}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }} // fix eslintjsx-a11y/mouse-events-have-key-events
                        // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                        onFocus={() => { }}
                        onBlur={() => { }} // end
                    >
                        Backtest Report
                    </div>
                }
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                modalRender={(modal) => (
                    <Draggable
                        disabled={disabled}
                        bounds={bounds}
                        onStart={(event, uiData) => onStart(event, uiData)}
                    >
                        <div ref={draggleRef}>{modal}</div>
                    </Draggable>
                )}
                width={1000}

                footer={null}
            >

                {
                    testReport === undefined ? <>Running test....</> :
                        <div>
                            <MetricsTable metrics={testReport.metrics} />
                            <CapitalFlowChart date={testReport.date} capitalFlow={testReport.capitalFlow} />
                            <Button onClick={handleAddBacktestLog} >Save to Backtest Logs</Button>
                        </div>
                }
            </Modal>
        </>
    );
}
