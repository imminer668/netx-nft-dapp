/*
 * @Author: imminer668 imminer@163.com
 * @Date: 2023-12-16 15:31:25
 * @LastEditors: imminer668 imminer@163.com
 * @LastEditTime: 2024-01-21 22:10:42
 * @FilePath: /next-dapp/pages/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import {
  nftAbi,
  nftAddr,
  tokenAbi,
  tokenAddr,
  marketAbi,
  marketAddr,
} from "../_utils/_abi";


export default function Home() {
  const [listData, setListData] = useState([]);
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [currentNetwork, setCurrentNetwork] = useState("");
  const [currentToken, setCurrentToken] = useState("");
  const [currentTokenBalance, setCurrentTokenBalance] = useState(0);
  const tokenIDRef = useRef(null);
  const priceRef = useRef(null);
  const addressRef = useRef(null);
  const tokenBalanceRef = useRef(0);

  function handleClick() {
    setCurrentAddress(count + 1);
  }

  const ether_connect = async () => {
    let provider = null;
    let signer = null;
    let address = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }

    if (signer) {
      provider
        .getNetwork()
        .then((network) => {
          setCurrentNetwork(network.name);
        })
        .catch((error) => {
          console.error(error);
        });
      let accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        let cAddress = accounts[0].address;

        //console.log("address::::==="+cAddress);
        setCurrentAddress(cAddress);
        addressRef.current = cAddress;
        //console.log("111111========"+currentAddress);

        //请求获取账号
        await provider.send("eth_requestAccounts", []);
        /// 获取当前账户的余额
        let balance = await provider.getBalance(cAddress);
        setCurrentBalance(ethers.formatEther(balance));
        //console.log("当前账户的地址: ", currentAddress);
        //console.log(`当前账户的余额: ${ethers.formatEther(balance)} ETH`);
      } else {
        setCurrentAddress("");
      }
    }
  };

  const getNFTMarketAllList = async () => {
    let provider = null;
    let signer = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    let contract = new ethers.Contract(marketAddr, marketAbi, provider);
    let activeListings = await contract.getActiveListings();
    /*let parsedResult =  activeListings.map((list) => {
      
      return {        
        tokenId: list.tokenId.toString(),
        seller: list.seller.toString(),
        price: list.price.toString(),
        active: list.active
      };
    });
    */
    let parsedResult = [];
    for (let i = 0; i < activeListings.length; i++) {
      //console.log("token"+parsedResult[i].tokenId);
      parsedResult.push({
        tokenId: activeListings[i].tokenId.toString(),
        seller: activeListings[i].seller.toString(),
        price: activeListings[i].price.toString(),
        active: activeListings[i].active,
        image: await getNFT(activeListings[i].tokenId.toString()),
      });
      //let imageUrl= getNFT(activeListings[i].tokenId);
      //      parsedResult[i].image="";
    }
    setListData(parsedResult);
    //console.log(parsedResult);
  };

  const listNFT = async () => {
    let provider = null;
    let signer = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    let tokenId = tokenIDRef.current.value;
    let price = priceRef.current.value;
    if (null !== tokenId && "" !== tokenId && null !== price && "" !== price) {
      let contract = new ethers.Contract(marketAddr, marketAbi, signer);
      let list = await contract
        .listNFT(tokenId, price)
        .then((res) => {
          alert("上架成功了");
          tokenIDRef.current.value = "";
          priceRef.current.value = "";
          console.log("成功==", res);
          window.location.reload();
        })
        .catch((err) => {
          alert("上架失败了");
          console.log("失敗~", err);
          console.log("失敗=", err.message);
        });
    }
  };
  const getNFT = async (tokenID) => {
    let provider = null;
    let signer = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    let contract = new ethers.Contract(nftAddr, nftAbi, provider);
    let tokenURI = await contract.tokenURI(tokenID);
    const response = await fetch(tokenURI);
    const jsonData = await response.json();
    //console.log("json:"+jsonData.image);
    return jsonData.image;
  };

  const buyNFT = async (tokenID, price) => {
    let provider = null;
    let signer = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    let contract = new ethers.Contract(marketAddr, marketAbi, signer);
    console.log("tokenID:" + tokenID);
    console.log("price:" + price);
    let list = await contract
      .buyNFT(tokenID, price)
      .then((res) => {
        alert("购买成功了");
        tokenIDRef.current.value = "";
        priceRef.current.value = "";
        console.log("成功==", res);
        window.location.reload();
      })
      .catch((err) => {
        alert("购买失败了");
        console.log("失敗~", err);
        console.log("失敗=", err.message);
      });
    //let tokenURI = await contract.tokenURI(tokenID);
    //const response = await fetch(tokenURI);
    //const jsonData = await response.json();
    //console.log("tokenID:"+tokenID);
    //console.log("price:"+price);

    //return jsonData.image;
  };

  const getTokenInfo = async () => {
    let provider = null;
    let signer = null;
    if (window.ethereum == null) {
      console.log("MetaMask not installed; using read-only defaults");
      provider = ethers.getDefaultProvider();
    } else {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    }
    let contract = new ethers.Contract(tokenAddr, tokenAbi, provider);
    let symbol = await contract.symbol();
    //console.log("currentAddress==" + currentAddress);
    //console.log("currentAddress==" + addressRef.current);

    let tokenBalance = await contract.balanceOf(addressRef.current);

    setCurrentTokenBalance(tokenBalance.toString());

    setCurrentToken(symbol);
    tokenBalanceRef.current = tokenBalance;
    console.log("tokenName==" + symbol);
    console.log("tokenBalance==" + tokenBalance);
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setCurrentAddress(accounts[0]);
      } else {
        setCurrentAddress("");
      }
    };
    const handleChainChanged = (chainId) => {
      setCurrentNetwork(chainId);
    };

    // 监听账户变化事件
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // 监听区块链网络变化事件
    window.ethereum.on("chainChanged", handleChainChanged);
    // 获取当前区块链网络

    //window.ethereum.request({ method: "eth_chainId" }).then((chainId) => {
    //setCurrentNetwork(chainId);
    ///});

    ether_connect().then((res) => {
      //console.log(1111111);
      getTokenInfo();
    });
    getNFTMarketAllList();
    return () => {
      // 组件卸载时清除监听器
      window.ethereum.off("accountsChanged", handleAccountsChanged);
      window.ethereum.off("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <>
      <div className="container">
        <div className="account-info">
          <p>当前账户的地址: {currentAddress}</p>
          <p>ETH余额: {currentBalance}ETH</p>
          <p>当前区块链网络: {currentNetwork}</p>
          <p>
            TokenName: <label>“{currentToken}”</label>余额 :{" "}
            {currentTokenBalance}
          </p>
        </div>

        <div className="nft-listing">
          <label htmlFor="tokenID">TokenID</label>
          <input ref={tokenIDRef} type="text" id="tokenID" name="tokenID" />
          <label htmlFor="price">Price:</label>
          <input id="price" ref={priceRef} type="text" name="price" />
          FF
          <button onClick={listNFT}>LIST 上架</button>
        </div>

        <div className="nft-list">
          <p>已上架的NFT</p>
          {listData.map((list) => (
            <ul key={list.tokenId}>
              <li>tokenID: {list.tokenId}</li>
              <li>price: {list.price} FF</li>
              <li>sellerAddress: {list.seller}</li>
              <li>
                <img width={211} height={230} src={list.image} alt="nft" />
              </li>
              <li>
                <button onClick={() => buyNFT(list.tokenId, list.price)}>
                  BUY 购买
                </button>
              </li>
            </ul>
          ))}
        </div>
      </div>
    </>
  );
}
