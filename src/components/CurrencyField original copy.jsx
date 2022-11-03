import React from "react";
const coins = require("../coinList.json");

function CurrencyField({ field, tokenName, getSwapPrice, balance, setCoin, loading, value, setContract, getContract }) {
  const getPrice = (value) => {
    getSwapPrice(value);
  };

  const changeCoin = (e) => {
    const coinObj = coins.find((coin) => coin.symbol === e.target.value);
    setContract(getContract());
    setCoin(coinObj);
  };

  return (
    <div className="row currencyInput">
      <div className="col-md-6 numberContainer">
        {loading ? (
          <div className="spinnerContainer">
            <spinner />
          </div>
        ) : (
          <input
            className="currencyInputField"
            placeholder="0.0"
            value={value}
            onBlur={(e) => (field === "input" ? getPrice(e.target.value) : null)}
          />
        )}
      </div>
      <div className="col-md-6 tokenContainer">
        <span className="tokenName">{tokenName}</span>
        <select onChange={changeCoin}>
          {coins.map((coin, idx) => (
            <option value={coin.symbol} key={idx}>
              {coin.symbol}
            </option>
          ))}
        </select>
        <div className="balanceContainer">
          <span className="balanceAmount">Balance: {balance?.toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}

export default CurrencyField;
