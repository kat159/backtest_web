import { Table } from 'antd'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import backtestLogService from '../../../../services/backtestLogService'
import DraggablePoppup from '../../popup/DraggablePoppup'
import StockChart from '../../popup/stockChart/StockChart'
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
        setBacktestRecordList(res);
      }
    )
  }, [])
  return (
    <div>
      {/* <span
        // onClick={(e)=>{e.preventDefault();}}   // 会stop child <a> from re-directing to the target url
        onMouseOver={(e)=>{e.preventDefault();}}
        onMouseLeave={(e)=>{e.preventDefault();}}
        onMouseEnter={(e)=>{e.preventDefault();}}
        onMouseOut={(e)=>{e.preventDefault();}}
      >
        <DraggablePoppup
          content={<StockChart />}
          title={<span>Stock Chart ( powered by <a href='https://github.com/rrag/react-stockcharts' > react-stockcharts</a> ) </span>}
        />
      </span> */}

      <Table dataSource={backtestRecordList} columns={columns}></Table>
      {/* <BacktestLogTable /> */}
    </div>
  )
}
