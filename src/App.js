// imports
import "./App.css";
import { useState } from "react";
import ConnectButton from "./components/ConnectButton";
import CurrencyField from "./components/CurrencyField";
import coinsJson from "./coinList.json";
import ERC20ABI from "./abi.json";
import { ethers } from "ethers";

// consts
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL_TESTNET);

function App() {
  // useStates
  const [coin1, setCoin1] = useState(coinsJson[0]);
  const [coin1Amount, setCoin1Amount] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [myAddress, setMyAddress] = useState(undefined);
  // function to getSigner
  const getSigner = async (provider) => {
    const tmpProvider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tmpProvider);
    tmpProvider.send("eth_requestAccounts");
    const tmpSigner = await tmpProvider.getSigner();
    setSigner(tmpSigner);
    const myAddress = await tmpSigner.getAddress();
    setMyAddress(myAddress);
    console.log('Signer Set',myAddress);
    await getBalance(coinsJson[0],myAddress);
  };

  // function to getWalletAddress
  const getBalance = async (coin,tmpAddress=false) => {
    const coinContract = new ethers.Contract(coin.address, ERC20ABI, web3Provider);
    const res = await coinContract.balanceOf(myAddress || tmpAddress);
    console.log("Balance in wallet: ", Number(ethers.utils.formatEther(res)));
    setCoin1(coin);
    setCoin1Amount(Number(ethers.utils.formatEther(res)));
  };

  // function to check if connected
  const isConnected = () => signer !== undefined;

  return (
    <div className="App">
      <div className="connectButtonContainer">
        <ConnectButton provider={provider} isConnected={isConnected} signerAddress={myAddress} getSigner={getSigner} />
      </div>
      <div className="appBody">
        <div className="swapContainer">
          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName={coin1.symbol}
              balance={coin1Amount}
              getBalance={getBalance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
