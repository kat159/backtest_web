import { Table } from 'antd';
import React from 'react';
import CapitalFlowChart from './CapitalFlowChart';
import { nanoid } from 'nanoid'


export default function MetricsTable(props) {
    const { metrics, } = props
    /*  每个metric一行
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
    */

    const convertCamelToName = (camelCaseName) => {
        // **!!Not working in some brower like IE
        return camelCaseName
            .replace(/([A-Z])/g, ' $1')  // insert a space before all caps
            .replace(/^./, str => str.toUpperCase()) + (camelCaseName === 'returnRate' ? ' %' : '');     // uppercase the first char
    }

    const columns = Object.keys(metrics).map(metricName => {
        return {
            title: convertCamelToName(metricName),
            dataIndex: metricName
        }
    })
    const data = [{ ...metrics, key: nanoid() }]
    return (
        <div>
            <Table className='custom-antd-table-small'
                columns={columns}
                dataSource={data}
                size="small"
                pagination={false}
            />
        </div>
    )
}
