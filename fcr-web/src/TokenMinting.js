import React, { Component } from 'react'
import web3 from './web3'
import fcr from './fcrjs/fcrWeb3'
import fcrSocket from './fcrjs/fcrSocketWeb3'
import { formatWeiNumberString } from './formatters'
import ShortAddress from './Components/ShortAddress'

class TokenMinting extends Component {

  constructor (props) {
    super(props)

    this.executeGimmeTokens = this.executeGimmeTokens.bind(this)
    this.handleTokenHolderNameChange = this.handleTokenHolderNameChange.bind(this)
    
    this.state = {
      tokenHolderName: '',
      gimmeTokensExecuting: false,
      tokenHolders: []
    }
  }

  componentWillMount () {
    fcrSocket.token.watchEvent(
      'Mint',
      null,
      (event) => {
        const { to, amount, data } = event.returnValues
        this.addTokenHolderToState(
          to,
          amount,
          web3.utils.toAscii(data)
        )
      },
      console.error
    )
    fcrSocket.token.watchEvent(
      'Transfer',
      null,
      (event) => {
        console.log('TRANSFER EVENT: ', event)
        // TODO: implement this
        // this.updateTokenHolderBalance()
      },
      console.error
    )
  }

  addTokenHolderToState(address, balance, name) {
    const tokenHolders = this.state.tokenHolders
    tokenHolders.push({
      address,
      balance,
      name
    })
    tokenHolders.push({
      address,
      balance,
      name
    })
    this.setState({ tokenHolders })
  }

  async executeGimmeTokens () {
    if (!this.state.gimmeTokensExecuting) {
      this.setState({ gimmeTokensExecuting: true })
      const tx = await fcr.token.gimmeTokens(
        this.props.account,
        this.state.tokenHolderName
      )
      console.log('gimmeTokens tx: ', tx)
      this.setState({ gimmeTokensExecuting: false })
    }
  }

  handleTokenHolderNameChange (event) {
		this.setState({ tokenHolderName: event.target.value })
  }

  renderGetTokenForm () {
    const getTokensForm = this.state.gimmeTokensExecuting ?
      <div>Getting token...</div> :
      (
        <div>
          <div className="form-group">
            <div className="input-label">Your Name:</div>
            <input
              value={this.state.tokenHolderName}
              onChange={this.handleTokenHolderNameChange}
            />
          </div>
          <br /><br />
          <div className="button" onClick={this.executeGimmeTokens}>Get Tokens</div>
        </div>
      )
    return getTokensForm
  }

  renderTokenHolderList () {
    let i = 0
    return this.state.tokenHolders.map((tokenHolder) => {
      i++
      return (
        <div key={`tokenHolder_${i}`}>
          <div>{tokenHolder.name}</div>
          <ShortAddress address={tokenHolder.address} />
          <div>balance: {formatWeiNumberString(tokenHolder.balance)}</div>
          <br /><br />
        </div>
      )
    })
  }

  render() {

    const tokenInfoView = parseInt(this.props.balance) > 0 ?
      <div>Your Token Balance: {formatWeiNumberString(this.props.balance)}</div> :
      this.renderGetTokenForm()

    return (
      <div>
        <h1>FCR Token</h1>
        {tokenInfoView}
        <br /><br />
        <h2>Holders</h2>
        {this.renderTokenHolderList()}
      </div>
    )
  }

}

export default TokenMinting
