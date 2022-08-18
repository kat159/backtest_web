import React from 'react'
import { Button, Form, Input, Select, Space, Tooltip, Typography, Radio, DatePicker } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

export default function BacktestParams(props) {
    const { dateFormat, } = props
    const minDate = moment('2010/01/01', dateFormat)
    const maxDate = moment('2020/01/01', dateFormat)
    return (
        <div>
            <legend style={{ paddingLeft: '20px', fontSize: '20px' }}><b>Backtest Params</b></legend>
            <Form.Item label="Strategy Name" name="strategyName"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item label="Description" name="description"
                rules={[
                    {
                        required: false,
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item label="Position Type" name="positionType"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Radio.Group>
                    <Radio.Button value="Long">Long</Radio.Button>
                    <Radio.Button value="Short">Short</Radio.Button>
                </Radio.Group>
            </Form.Item >
            <Form.Item label="Max Holding Days" name="holdingDays"
                rules={[
                    {
                        required: true,
                    },
                    {
                        message: 'Must Be Integer',
                        validator: (_, value) => {
                            if (value === undefined) {
                                return Promise.resolve();
                            }
                            value = value.toString();
                            if (value.indexOf('.') === -1) {
                                return Promise.resolve();
                            } else {
                                return Promise.reject('');
                            }
                        }
                    }
                ]}
            >
                <Input type={'number'} />
            </Form.Item>
            <Form.Item label="Initial Capital" name="capital"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input type={'number'} />
            </Form.Item>
            <Form.Item label="Capital At Risk %" name="capitalAtRisk"
                rules={[
                    {
                        required: true,
                    },
                    {
                        message: 'Number from 0 to 100',
                        validator: (_, value) => {
                            if (value === undefined) {
                                return Promise.resolve();
                            }
                            value = value.toString();
                            if (parseFloat(value) > 100 || parseFloat(value) < 0) {
                                return Promise.reject('');
                            } else {
                                return Promise.resolve();
                            }
                        }
                    }
                ]}
            >
                <Input type={'number'} />
            </Form.Item>
            <Form.Item label="Commission %" name="commission"
                rules={[
                    {
                        required: true,
                    },
                    {
                        message: 'Number from 0 to 100',
                        validator: (_, value) => {
                            if (value === undefined) {
                                return Promise.resolve();
                            }
                            value = value.toString();
                            if (parseFloat(value) > 100 || parseFloat(value) < 0) {
                                return Promise.reject('');
                            } else {
                                return Promise.resolve();
                            }
                        }
                    }
                ]}
            >
                <Input type={'number'} />
            </Form.Item>
            <Form.Item label="Bid-Ask Spread" name="bidAskSpread"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input type={'number'} />
            </Form.Item>
            <Form.Item label="Time Period"
                name="timePeriod"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <RangePicker
                    disabledDate={(momentDate) => momentDate < minDate || momentDate > maxDate}
                    format={dateFormat}
                />
            </Form.Item>

        </div>
    )
}
