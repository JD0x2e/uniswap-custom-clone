// imports
import "./App.css";
import { useState } from "react";
import ConnectButton from "./components/ConnectButton";
import Uniswapper from "./components/Uniswapper";
import coinsJson from "./coinList.json";
import ERC20ABI from "./abi.json";
import { ethers } from "ethers";

// consts
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL_TESTNET);

function App() {
  // useStates
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [myAddress, setMyAddress] = useState(undefined);
  
  const connectWallet = async (provider) => {
    const tmpProvider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tmpProvider);
    tmpProvider.send("eth_requestAccounts");
    const tmpSigner = await tmpProvider.getSigner();
    setSigner(tmpSigner);
    const myAddress = await tmpSigner.getAddress();
    setMyAddress(myAddress);
    console.log('Signer Set',myAddress);
  };


  // function to check if connected
  const isConnected = () => signer !== undefined;

  return (
    <div className="App">
      <div className="connectButtonContainer">
        <ConnectButton provider={provider} isConnected={isConnected} signerAddress={myAddress} getSigner={connectWallet} />
      </div>
      <div className="appBody">
        <Uniswapper
          provider={provider}
          signer={signer}
        />
      </div>
    </div>
  );
}

export default App;
