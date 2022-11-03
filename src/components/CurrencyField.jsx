import React from "react";
const coins = require("../coinList.json");

function CurrencyField({ tokenName, balance, getBalance }) {
  const changeCoin = (e) => {
    const coinObj = coins.find((coin) => coin.symbol === e.target.value);
    getBalance(coinObj);
  };

  return (
    <div className="row currencyInput">
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
