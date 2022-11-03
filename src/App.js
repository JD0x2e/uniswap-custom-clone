// imports
import "./App.css";
import { useState, useEffect } from "react";
import { GearFill } from "react-bootstrap-icons";
import PageButton from "./components/PageButton";
import ConfigModal from "./components/ConfigModal";
import ConnectButton from "./components/ConnectButton";
import CurrencyField from "./components/CurrencyField";
import coinsJson from "./coinList.json";
import { CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import ERC20ABI from "./abi.json";
import BeatLoader from "react-spinners/BeatLoader";
import JSBI from "jsbi";
import { AlphaRouter } from "@uniswap/smart-order-router";
import { ethers, BigNumber } from "ethers";

// consts
const chainId = 5;
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.REACT_APP_INFURA_URL_TESTNET);
const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const router = new AlphaRouter({ chainId: chainId, provider: web3Provider });

function App() {
  // useStates
  const [coin1, setCoin1] = useState(coinsJson[0]);
  const [coin2, setCoin2] = useState(coinsJson[1]);
  const [coin1Contract, setCoin1Contract] = useState(undefined);
  const [coin2Contract, setCoin2Contract] = useState(undefined);
  const [coin1Amount, setCoin1Amount] = useState(undefined);
  const [coin2Amount, setCoin2Amount] = useState(undefined);

  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [signerAddress, setSignerAddress] = useState(undefined);

  const [slippageAmount, setSlippageAmount] = useState(2);
  const [deadlineMinutes, setDeadlineMinutes] = useState(10);
  const [showModal, setShowModal] = useState(undefined);

  const [inputAmount, setInputAmount] = useState(undefined);
  const [outputAmount, setOutputAmount] = useState(undefined);
  const [transaction, setTransaction] = useState(undefined);
  const [loading, setLoading] = useState(undefined);
  const [ratio, setRatio] = useState(undefined);

  // useEffects
  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      // const contract1 = new Token(chainId, coin1.address, coin1.decimal, coin1.symbol, coin1.name);

      // const contract1 = getCoin1Contract();
      // const contract2 = getCoin2Contract();

      setCoin1Contract(getCoin1Contract());
      setCoin2Contract(getCoin2Contract());

      if (signer !== undefined) {
        getWalletAddress();
      }
    };
    onLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin1Amount, coin2Amount]);

  // function to runSwap
  const runSwap = async (transaction, signer) => {
    const approvalAmount = ethers.utils.parseUnits("10", 18).toString();
    const contract0 = getCoin1Contract();
    await contract0.connect(signer).approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount);

    signer.sendTransaction(transaction);
  };

  // functions to getCoinContracts
  const getCoin1Contract = () => new ethers.Contract(coin1.address, ERC20ABI, web3Provider);
  const getCoin2Contract = () => new ethers.Contract(coin2.address, ERC20ABI, web3Provider);

  // function to getSigner
  const getSigner = async (provider) => {
    provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer);
  };
  // function to check if connected
  const isConnected = () => signer !== undefined;

  // function to getWalletAddress
  const getWalletAddress = () => {
    signer.getAddress().then((address) => {
      setSignerAddress(address);

      // web3Provider.getBalance(address).then((res) => console.log(Number(ethers.utils.formatEther(res))));

      coin1Contract.balanceOf(address).then((res) => {
        console.log("Balance in wallet: ", Number(ethers.utils.formatEther(res)));
        setCoin1Amount(Number(ethers.utils.formatEther(res)));
      });
      coin2Contract.balanceOf(address).then((res) => {
        setCoin2Amount(Number(ethers.utils.formatEther(res)));
      });

      // coin1Contract.balanceOf(address).then((res) => {
      //   setCoin1Amount(Number(ethers.utils.formatEther(res)));
      // });

      // coin2Contract.balanceOf(address).then((res) => {
      //   setCoin2Amount(Number(ethers.utils.formatEther(res)));
      // });
    });
  };

  if (signer !== undefined) {
    getWalletAddress();
  }

  // function to getPrice
  const getPrice = async (inputAmount, slippageAmount, deadline, walletAddress) => {
    const percentSlippage = new Percent(slippageAmount, 100);
    const wei = ethers.utils.parseUnits(inputAmount.toString(), coin1.decimal);
    const currencyAmount = CurrencyAmount.fromRawAmount(coin1, JSBI.BigInt(wei));

    const route = await router.route(currencyAmount, coin2, TradeType.EXACT_INPUT, {
      recipient: walletAddress,
      slippageTolerance: percentSlippage,
      deadline: deadline,
    });

    const transaction = {
      data: route.methodParameters.calldata,
      to: V3_SWAP_ROUTER_ADDRESS,
      value: BigNumber.from(route.methodParameters.value),
      from: walletAddress,
      gasPrice: BigNumber.from(route.gasPriceWei),
      gasLimit: ethers.utils.hexlify(1000000),
    };

    const quoteAmountOut = route.quote.toFixed(6);
    const ratio = (inputAmount / quoteAmountOut).toFixed(3);

    return [transaction, quoteAmountOut, ratio];
  };

  // function to getSwapPrice
  const getSwapPrice = (inputAmount) => {
    setLoading(true);
    setInputAmount(inputAmount);

    // function to getPrice
    const swap = getPrice(
      inputAmount,
      slippageAmount,
      Math.floor(Date.now() / 1000 + deadlineMinutes * 60),
      signerAddress
    ).then((data) => {
      setTransaction(data[0]);
      setOutputAmount(data[1]);
      setRatio(data[2]);
      setLoading(false);
    });
  };

  // return
  return (
    <div className="App">
      <div className="appNav">
        <div className="my-2 buttonContainer buttonContainerTop">
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"} />
          <PageButton name={"Vote"} />
          <PageButton name={"Charts"} />
        </div>

        <div className="rightNav">
          <div className="connectButtonContainer">
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
          <div className="my-2 buttonContainer">
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>

      <div className="appBody">
        <div className="swapContainer">
          <div className="swapHeader">
            <span className="swapText">Swap</span>
            <span className="gearContainer" onClick={() => setShowModal(true)}>
              <GearFill />
            </span>
            {showModal && (
              <ConfigModal
                onClose={() => setShowModal(false)}
                setDeadlineMinutes={setDeadlineMinutes}
                deadlineMinutes={deadlineMinutes}
                setSlippageAmount={setSlippageAmount}
                slippageAmount={slippageAmount}
              />
            )}
          </div>

          <div className="swapBody">
            <CurrencyField
              field="input"
              tokenName={coin1.symbol}
              getSwapPrice={getSwapPrice}
              value={inputAmount}
              signer={signer}
              setCoin={setCoin1}
              balance={coin1Amount}
              spinner={BeatLoader}
              loading={loading}
              setContract={setCoin1Contract}
              getContract={getCoin1Contract}
            />
            <CurrencyField
              field="output"
              tokenName={coin2.symbol}
              getSwapPrice={getSwapPrice}
              value={outputAmount}
              signer={signer}
              setCoin={setCoin2}
              balance={coin2Amount}
              spinner={BeatLoader}
              loading={loading}
              setContract={setCoin2Contract}
              getContract={getCoin2Contract}
            />
          </div>

          <div className="ratioContainer">{ratio && <>{`1 UNI = ${ratio} WETH`}</>}</div>

          <div className="swapButtonContainer">
            {isConnected() ? (
              <div onClick={() => runSwap(transaction, signer)} className="swapButton">
                Swap
              </div>
            ) : (
              <div onClick={() => getSigner(provider)} className="swapButton">
                Connect Wallet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
