import { Table } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import backtestLogService from '../../../../services/backtestLogService'
import BacktestLogTable from './BacktestLogTable'

export default function BacktestLog() {
  const [backtestRecordList, setBacktestRecordList] = useState([])

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Tested Strategy',
      dataIndex: 'strategy_name',
      key: 'strategy_name',
    },
    {
      title: 'Metrics',
      key: 'metrics',
      children: [
        {
          title: 'Return Rate%',
          dataIndex: 'returnRate',
          key: 'returnRate',
          sorter: {
            multiple: true
          },
        },
        {
          title: 'Max Drawdown%',
          dataIndex: 'maxDrawdown',
          key: 'maxDrawdown',
          sorter: {
            multiple: true
          },
        },
        {
          title: 'Sharpe Ratio',
          dataIndex: 'sharpe',
          key: 'sharpe',
          sorter: {
            multiple: true
          },
        },
        {
          title: 'Standard Deviation',
          dataIndex: 'standardDeviation',
          key: 'standardDeviation',
          sorter: {
            multiple: true
          },
        }
      ]
    },
  ]

  useEffect(() => {
    backtestLogService.getAll().then(
      res => {
        console.log(res)
        setBacktestRecordList(res);
      }
    )
  }, [])
  return (
    <div>
      <Table dataSource={backtestRecordList} columns={columns}></Table>
      {/* <BacktestLogTable /> */}
    </div>
  )
}
