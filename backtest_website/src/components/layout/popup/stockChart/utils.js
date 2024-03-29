import { timeParse } from "d3-time-format";
import moment from "moment";
import indicatorService from "../../../../services/indicatorService";
import stockService from "../../../../services/stockService";

function parseData(parse) {
    return function (d) {
        d.date = parse(d.date);
        d.open = +d.open;
        d.high = +d.high;
        d.low = +d.low;
        d.close = +d.close;
        d.volume = +d.volume;
        return d;
    };
}

const parseDate = timeParse("%Y-%m-%d");

// **TODO：交给stock chart之前就fetch好，每次外部某个indicator参数改变，
// 只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
async function getVariablesData(stockSymbol, indicators) {
    const variablesData = {}
    for (const indicator of indicators) {
        for (const variable of indicator.variables) {
            const data = await indicatorService.calculateByFormula(stockSymbol, variable.formula)
            variablesData[variable.formula] = data.data
        }
    }
    // console.log(variablesData);
    return variablesData
}

function getStockTrackingData(symbol, trackChartSetting, dailyTestReport) {
    if (!trackChartSetting) {
        return {}
    }
    const date_to_data = {}
    // console.log(trackChartSetting, dailyTestReport)
    for (const curDayReport of dailyTestReport) {
        const positions = curDayReport.cur_position_detail
        const date = curDayReport.date
        for (const position of positions) {
            if (position.symbol === symbol) {
                date_to_data[date] = {
                    holdingAmount: position.market_value,
                    netAccumReturn: position.net_accum_return
                }
                break
            }
        }
    }
    // console.log(date_to_data)
    return date_to_data
}

export async function getData(data) {
    const {stockSymbol, indicators, trackChartSetting, dailyTestReport} = data
    const stockData = await stockService.getBySymbols([stockSymbol]);

    // **TODO：variablesData 交给stock chart之前就fetch好，每次外部某个indicator参数改变，
    // 只重新fetch参数改变的那个indicator，不然indicators参数一改，stockChart就要重新全部fetch
    const variablesData = await getVariablesData(stockSymbol, indicators);

    const stockTrackingData = getStockTrackingData(stockSymbol, trackChartSetting, dailyTestReport)

    const stock = stockData.data.data[0]
    const res = []
    for (let i = 0; i < stock.close.length; i++) {
        const curDate = moment(stock.timestamp[i] * 1000).format('YYYY-MM-DD')
        const d = {
            date: parseDate(moment(stock.timestamp[i] * 1000).format('YYYY-MM-DD')),
            open: stock.open[i],
            high: stock.high[i],
            low: stock.low[i],
            close: stock.close[i],
            volume: stock.volume[i],
            split: "",
            dividend: "",
            absoluteChange: "",
            percentChange: "",
        }
        for (const formula in variablesData) {
            d[formula] = variablesData[formula][i]
        }
        const trackData = stockTrackingData[curDate]
        d.holdingAmount = trackData ? (trackData.holdingAmount ?? '') : ''
        d.netAccumReturn = trackData ? (trackData.netAccumReturn ?? '') : ''
        res.push(d)
    }
    // console.log(res)
  	return new Promise((resolve, reject) => {
  		resolve(res);
  })
}
