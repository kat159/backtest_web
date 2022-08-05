import { Table } from 'antd'
import React from 'react'

export default function PositionStatusTable(props) {
    const {testReport, curIndex} = props
    const dailyReport = testReport.daily_test_report
    const curDayReport = curIndex ? dailyReport[curIndex] : undefined
    console.log(curDayReport)
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
        {
            title: 'Position Detail',
            // dataIndex: 'cur_position_detail',
        },
        {
            title: 'Position Change',
            // dataIndex: 'position_change',
        },
    ]


    return (
        <div>
            <Table 
            columns={columns} 
            dataSource={[curDayReport]}
            size="small" 
            pagination={false}
            />
        </div>
    )
}
