import React, { Component, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, getElementAtEvent, } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function CapitalFlowChart(props) {
    const chartRef = useRef();

    const { date, capitalFlow, handleChartValueClick } = props
    const labels = date
    const data = {
        labels,
        datasets: [
            {
                label: 'Capital',
                data: capitalFlow,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
        ]
    }

    // console.log('flow chart re redenr')

    const options = {
        responsive: true,
        // maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                display: false
            },
            title: {
                display: true,
                text: 'Capital Flow Chart',
            },
        },
        // fill: false,
        interaction: {
            intersect: false,        // true表示hover到point上才显示tooltips
            mode: 'index'            // default mode='nearest'是鼠标离哪个point近显示哪个，而不是按照鼠标在哪个index显示哪个
        },
        radius: 0,                   // point半径
        onClick: (event, element) => {      // element为intersect的point
            if (element.length > 0) {
                handleChartValueClick(element[0].index);
            }
        }
        
    };


    return (
        <div>
            <Line
                ref={chartRef}
                options={options}
                data={data}
                // height={500}
            />
        </div>
    )
}
