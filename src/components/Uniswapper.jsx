import React from "react";
import { useState } from "react";
import { ethers, BigNumber } from "ethers";
import ERC20ABI from "../abi.json";
import { JSBI, Fetcher, Route, ChainId, WETH } from '@uniswap/sdk';
const coins = require("../coinList.json");
const { Token, CurrencyAmount, TradeType, Percent } = require("@uniswap/sdk-core");
const { AlphaRouter } = require("@uniswap/smart-order-router");
const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const chainId = 5;
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL_TESTNET);
let router = new AlphaRouter({ chainId: chainId, provider: web3Provider });

function Uniswapper(props) {

  const provider = props.provider;
  const signer = props.signer;
  let myAddress = '0x0';
  if (signer) {
    (async() => myAddress = await signer.getAddress())();
  }

  const [coin1, setCoin1] = useState(coins[0]);
  const [coin2, setCoin2] = useState(coins[1]);
  const [refresh, refreshStates] = useState(false);

  const changeCoin1 = async (e) => {
    if(!signer) alert('Connect Wallet First');
    const coinObj = coins.find((coin) => coin.symbol === e.target.value);
    const coinWithBalance = await getBalance(coinObj);
    setCoin1(coinWithBalance);
  };

  const changeCoin2 = async (e) => {
    if(!signer) alert('Connect Wallet First');
    const coinObj = coins.find((coin) => coin.symbol === e.target.value);
    const coinWithBalance = await getBalance(coinObj);
    setCoin2(coinWithBalance);
  };

  const getBalance = async (coin) => {
    const coinContract = new ethers.Contract(coin.address, ERC20ABI, provider);
    const res = await coinContract.balanceOf(myAddress) || 0;
    console.log("Balance in wallet: ", Number(ethers.utils.formatEther(res)));
    coin.balance = Number(ethers.utils.formatEther(res));
    return coin;
  };

  const changeValue1 = async (e) => {
    coin1.value = e.target.value;
    coin1.chainId = chainId;
    coin1.bypassChecksum = true;
    coin1.decimals = coin1.decimal; // :*(
    setCoin1(coin1);
    coin2.value = await checkPrice(coin1);
    setCoin2(coin2);
  };

  const checkPrice = async (coin) => {
    console.log('Checking Price...', coin.value);
    const deadline = Math.floor((Date.now() / 1000) + 120);
    const percentSlippage = new Percent(5, 100);
    const wei = ethers.utils.parseUnits(coin.value.toString(), coin.decimals);
    const uniToken1 = new Token(chainId, coin1.address, coin1.decimal);
    const uniToken2 = new Token(chainId, coin2.address, coin2.decimal);
    uniToken1.name = coin1.name;
    uniToken1.symbol = coin1.symbol;
    uniToken2.name = coin2.name;
    uniToken2.symbol = coin2.symbol;
    //console.log(uniToken1)
    //const wethPair1 = await Fetcher.fetchPairData(uniToken1, uniToken2);
    const currencyAmount = CurrencyAmount.fromRawAmount(uniToken1, JSBI.BigInt(coin.value.toString()));

    const route = await router.route(currencyAmount, uniToken2, TradeType.EXACT_INPUT, {
      recipient: myAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    });

    const quoteAmountOut = route.quote.toFixed(6);
    //const ratio = (coin.value / quoteAmountOut).toFixed(3);
    return quoteAmountOut;
  }

  let initialUpdateAfterConnect = async () => {
    if (!signer) {
      setTimeout(() => {
        initialUpdateAfterConnect();
      }, 500);
    } else {
      myAddress = await signer.getAddress();
      const coin1tmp = await getBalance(coin1);
      setCoin1(coin1tmp);
      const coin2tmp = await getBalance(coin2);
      setCoin2(coin2tmp);
      refreshStates(true);
    }
  }
  if (!coin1.balance) initialUpdateAfterConnect();

  return (
    <div className="swapContainer">
      <div className="swapBody">

        <div className="row currencyInput">
          <div className="col-md-6 numberContainer">
           <input
              className="currencyInputField"
              placeholder="0.0"
              value={coin1.value}
              onChange={changeValue1}
            />
          </div>
          <div className="col-md-6 tokenContainer">
            <span className="tokenName">{coin1.symbol}</span>
            <select onChange={changeCoin1}>
              <option value="Select" key="-1">Select</option>
              {coins.map((coin, idx) => (
                <option value={coin.symbol} key={idx}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <div className="balanceContainer">
              <span className="balanceAmount">Balance: {coin1.balance?.toFixed(3)}</span>
            </div>
          </div>
        </div>

        <div className="row currencyInput">
          <div className="col-md-6 numberContainer">
           <input
              className="currencyInputField"
              placeholder="0.0"
              value={coin2.value}
              //onChange={checkPrice}
            />
          </div>
          <div className="col-md-6 tokenContainer">
            <span className="tokenName">{coin2.symbol}</span>
            <select onChange={changeCoin2}>
              <option value="Select" key="-1">Select</option>
              {coins.map((coin, idx) => (
                <option value={coin.symbol} key={idx}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <div className="balanceContainer">
              <span className="balanceAmount">Balance: {coin2.balance?.toFixed(3)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Uniswapper;
