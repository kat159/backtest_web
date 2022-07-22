import { Table } from 'antd';
import React from 'react';
import CapitalFlowChart from './CapitalFlowChart';



export default function MetricsTable(props) {
    const { metrics, } = props
    const columns = [
        {
            title: 'Metric',
            dataIndex: 'metric',
        },
        {
            title: 'Value',
            dataIndex: 'value',
        },
    ];
    const data = []
    let i = 0;
    for (const metric in metrics) {
        data.push({key: i++, metric: metric, value: metrics[metric]})
    }

    return (
        <div>
            <Table columns={columns} dataSource={data} size="small" />
        </div>
    )
}
