
import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  CandlestickSeries,
  LineSeries,
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

import {
  OHLCTooltip, SingleValueTooltip,
} from "react-stockcharts/lib/tooltip";

import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import pixelWitdh from 'string-pixel-width'
import { nanoid } from "nanoid";


let textSimulator = ''

class CandleStickStockScaleChartWithVolumeBarV3 extends React.Component {
  render() {
    const { type, data: initialData, width, ratio, indicators } = this.props;

    const xScaleProvider = discontinuousTimeScaleProvider
      .inputDateAccessor(d => d.date);
    const {
      data,
      xScale,
      xAccessor,
      displayXAccessor,
    } = xScaleProvider(initialData);

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 100)]);
    const xExtents = [start, end];

    return (
      <ChartCanvas height={660}
        ratio={ratio}
        width={width}
        margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >

        <Chart id={1} height={300} yExtents={d => [d.high, d.low]} >
          <YAxis axisAt="right" orient="right" ticks={5} />
          <XAxis axisAt="bottom" orient="bottom" showTicks={false} />
          <CandlestickSeries />
          <OHLCTooltip forChart={1} origin={[-40, 0]} />

          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")} />

        </Chart>

        {
          indicators.map((indicator, index) => {
            textSimulator = '';
            const { id: indicatorId, indicatorName, tickNum, tickDemical, variables, } = indicator
            const formulas = []
            for (const variable of variables) {
              formulas.push(variable.formula);
            }
            const indicatorNum = indicators.length
            const totalHeight = 300
            const topPadding = 20
            const heightForEach = (totalHeight - topPadding * indicatorNum) / indicatorNum
            const startDistanceToBottom = totalHeight
            const curDistanceToBottom = startDistanceToBottom - (20 + heightForEach) * index

            return <Chart id={index + 2} key={nanoid()}
              origin={(w, h) => [0, h - curDistanceToBottom]}
              height={heightForEach}
              yExtents={d => {
                const minY = Math.min(...formulas.map(formula => d[formula]))
                const maxY = Math.max(...formulas.map(formula => d[formula]))
                return [minY, maxY]
              }}

            >
              <YAxis
                axisAt="right"
                orient="right"
                ticks={tickNum}
                // tickFormat={format("." + tickDemical + "s")}   // 用了之后-0.1会变成-100M
                tickFormat={format("." + tickDemical + "f")}
              />
              <XAxis
                axisAt="bottom"
                orient="bottom"
                showTicks={index === indicators.length - 1 ? true : false}
              />
              <MouseCoordinateY
                at="right"
                orient="right"
                displayFormat={format("." + tickDemical + "f")}
              />
              {   // Line / Bar Series
                variables.map((variable, index) => {
                  const { name, formula, type, color, colorSelector } = variable
                  return type === 'Bar' ?
                    <BarSeries
                      key={nanoid()}
                      yAccessor={d => d[formula]}
                      fill={colorSelector}
                    /> :
                    <LineSeries
                      key={nanoid()}
                      yAccessor={d => d[formula]}
                      stroke={color}
                    />
                })
              }

              {
                variables.map((variable, index) => {
                  const { name, formula, type, color, colorSelector, vairableTickDemical } = variable
                  // console.log(textSimulator)
                  const indent = -23 + (
                    pixelWitdh(
                      textSimulator,
                      { size: 11 }
                    ) +
                    // pixelWitdh(    // variable的decimal不同就会出错
                    //   ' L0.' + (new Array(vairableTickDemical ?? tickDemical).fill(0).join('')),
                    //   { size: 11 }
                    // ) * index +
                    (index === 0 ? 0 : pixelWitdh('Edit ', { size: 11 }))
                  ) * 1

                  textSimulator += name + '   L0' + new Array(vairableTickDemical ?? tickDemical).fill(0).join('')

                  return <SingleValueTooltip
                    key={nanoid()}
                    onClick={(e) => {
                      console.log(index);
                      if (index === 0) {
                        // onEditClick(indicatorId);
                      }
                      e.stopPropagation()
                    }}
                    yAccessor={d => d[formula]}
                    yLabel={(index === 0 ? 'Edit ' : '') + name}
                    yDisplayFormat={format("." + (vairableTickDemical ?? tickDemical) + "f")}
                    /* valueStroke={atr14.stroke()} - optional prop */
                    /* labelStroke="#4682B4" - optional prop */
                    origin={[indent, -5,]}
                  />
                })
              }

              { // Y轴Date底角注释
                index === indicators.length - 1 &&
                <MouseCoordinateX
                  at="bottom"
                  orient="bottom"
                  displayFormat={timeFormat("%Y-%m-%d")}
                />
              }

            </Chart>
          })
        }

        <CrossHairCursor />

      </ChartCanvas>
    );
  }
}
CandleStickStockScaleChartWithVolumeBarV3.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickStockScaleChartWithVolumeBarV3.defaultProps = {
  type: "svg",
};
CandleStickStockScaleChartWithVolumeBarV3 = fitWidth(CandleStickStockScaleChartWithVolumeBarV3);

export default CandleStickStockScaleChartWithVolumeBarV3;
