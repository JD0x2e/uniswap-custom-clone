// imports
import "./App.css";
import { useState, useEffect } from "react";
import ConnectButton from "./components/ConnectButton";
import CurrencyField from "./components/CurrencyField";
import coinsJson from "./coinList.json";
import ERC20ABI from "./abi.json";
import { ethers } from "ethers";

// consts
const address = "0x07cd4706735760050f2fC392db7D802e4e02FdF1";
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL_TESTNET);

function App() {
  // useStates
  const [coin1, setCoin1] = useState(coinsJson[0]);
  const [coin1Contract, setCoin1Contract] = useState(undefined);
  const [coin1Amount, setCoin1Amount] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);

  // useEffects
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      setCoin1Contract(getCoin1Contract());
    };
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // functions to getCoinContracts
  const getCoin1Contract = () => new ethers.Contract(coin1.address, ERC20ABI, web3Provider);

  // function to getSigner
  const getSigner = async (provider) => {
    provider.send("eth_requestAccounts");
    const signer = provider.getSigner();
    setSigner(signer);
  };

  // function to getWalletAddress
  const getWalletAddress = () => {
    coin1Contract.balanceOf(address).then((res) => {
      console.log("Balance in wallet: ", Number(ethers.utils.formatEther(res)));
      setCoin1Amount(Number(ethers.utils.formatEther(res)));
    });
  };

  if (signer !== undefined) {
    getWalletAddress();
  }

  // function to check if connected
  const isConnected = () => signer !== undefined;

  return (
    <div className="App">
      <div className="connectButtonContainer">
        <ConnectButton provider={provider} isConnected={isConnected} signerAddress={address} getSigner={getSigner} />
      </div>

      <div className="appBody">
        <div className="swapContainer">
          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName={coin1.symbol}
              signer={signer}
              setCoin={setCoin1}
              balance={coin1Amount}
              setContract={setCoin1Contract}
              getContract={getCoin1Contract}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
