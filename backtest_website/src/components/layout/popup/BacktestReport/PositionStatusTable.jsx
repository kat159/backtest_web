import { LineChartOutlined } from '@ant-design/icons'
import { Col, Radio, Row, Space, Table, Button } from 'antd'
import { nanoid } from 'nanoid'
import React, { useState } from 'react'

export default function PositionStatusTable(props) {
    const { testReport, curIndex, handleOpenStockChart } = props
    const dailyReport = testReport.daily_test_report
    const curDayReport = dailyReport[curIndex === undefined ? Math.min(25, dailyReport.length) : curIndex]
    curDayReport.key = nanoid()
    // console.log(curDayReport)
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
        },
        {
            title: 'Total Capital',
            dataIndex: 'capital',
        },
        {
            title: 'Available Capital',
            dataIndex: 'available_capital',
        },
    ]

    const positionDetailColumns = [
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            render: (text, value, index) => {
                return <a onClick={e => {
                    handleOpenStockChart(text)
                }}>{text} <LineChartOutlined /></a>
            }
        },
        {
            title: 'Price Today',
            dataIndex: 'price_today',
        },
        {
            title: 'Hands',
            dataIndex: 'hands',
        },
        {
            title: 'Market Value',
            dataIndex: 'market_value',
        },
        {
            title: 'Avg Bid Price',
            dataIndex: 'average_bid_price',
        },
        {
            title: 'Commission',
            dataIndex: 'commission',
        },
        {
            title: 'Net Accum Return %',
            dataIndex: 'net_accum_return',
        },

    ]
    const positionDetailTable = <Table className='custom-antd-table-small-10'
        columns={positionDetailColumns}
        dataSource={curDayReport.cur_position_detail}
        size='small'
    />


    const positionChangeColumns = [
        {
            title: 'Symbol',
            dataIndex: 'symbol',
            render: (text, value, index) => {
                return <a onClick={e => {
                    handleOpenStockChart(text)
                }}>{text} <LineChartOutlined /></a>
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
        },
        {
            title: 'Bid Price',
            dataIndex: 'bid_price',
        },
        {
            title: 'Hands',
            dataIndex: 'hands',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
        },
        {
            title: 'Commission',
            dataIndex: 'commission',
        },
        {
            title: 'Cause',
            dataIndex: 'reason',
        },


    ]
    const positionChangeTable = <Table className='custom-antd-table-small-10'
        columns={positionChangeColumns}
        dataSource={curDayReport.position_change}
        size='small'
    />


    const [selectedDailyDetail, setSelectedDailyDetail] = useState('current_position')
    const onChange = (e) => {
        // console.log(e.target.value)
        setSelectedDailyDetail(e.target.value)
    }

    return (
        <div>

            <Row>
                <Radio.Group onChange={onChange} defaultValue="current_position" >
                    <Space direction="vertical" >
                        <Radio value="current_position" style={{
                            fontSize: '11px'
                        }}>current position</Radio>
                        <Radio value="transactions" style={{
                            fontSize: '11px'
                        }}>transactions</Radio>
                    </Space>
                </Radio.Group>
                <Col flex={10}>
                    <Table
                        className='custom-antd-table-small'
                        columns={columns}
                        dataSource={[curDayReport]}
                        size='small'
                        pagination={false}
                    />
                </Col>

            </Row>
            {selectedDailyDetail === 'current_position' ? positionDetailTable : positionChangeTable}
        </div>
    )
}
