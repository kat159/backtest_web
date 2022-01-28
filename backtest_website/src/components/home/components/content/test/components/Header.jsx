import React, { Component } from 'react'

export default class Header extends Component {
    render() {
        return (
            <div>
                <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Build your strategy and run test, and see how your strategy performs</h3>
                <fieldset>
                    <div className="field">
                        <label>Strategy Name &nbsp;&nbsp;&nbsp;&nbsp;
                            <input ref={c => this.strategyName = c} type='text' name='strategyName' />
                        </label>
                    </div>

                    <div className="field">
                        <label >Position Type &nbsp;&nbsp;&nbsp;&nbsp;
                            <select ref={c => this.positionType = c} name='positionType'>
                                <option>Long</option>
                                <option>Short</option>
                            </select>
                        </label>
                    </div>
                </fieldset>
            </div>
        )
    }
}
