import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { NotificationManager } from 'react-notifications';
import { ExternalProvider } from '@ethersproject/providers';

import contract from './contracts/NFT.json';

declare global {
  interface Window {
    ethereum: import('ethers').providers.ExternalProvider;
  }
}

interface MeataData {
  image: string;
  name: string;
}

const contractAddress = '0x1A1AAbEEEc644BA425b00A5Bb942a8EfAA06ec9e';
const abi = contract.abi;
const myAddress = '0xD837c7c67BD3A63E9D6ece6752F130A55d64BDB5';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([] as MeataData[]);
  useEffect(() => {
    checkWalletIsConnected();
    fetchData();
  }, []);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert('Plase install Metamask!');
    } else {
      console.log("Walllet exits! We're ready to go!");
    }
    try {
      if (ethereum.request) {
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          console.log('Not authorized account found');
        }
      }
    } catch (e) {
      console.error(3);
    }
  };

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        let nftTxn = await nftContract.mintTo(myAddress, {
          value: ethers.utils.parseEther('0.008')
        });

        await nftTxn.wait();

        setLoading(false);
        NotificationManager.success(
          `Success, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        let currentTokenId = await nftContract.getCurrentTokenId();
        let results = [] as MeataData[];

        for (let i = 1; i < parseInt(currentTokenId); i++) {
          let metaDataUrl = await nftContract.tokenURI(i);
          let metadata = await fetch(metaDataUrl).then((res) => res.json());
          results.push(metadata);
        }
        setImages([...results]);
        setLoading(false);
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1 className="text-center my-5 text-blue-800">Welcome here to mint Token!</h1>
      <div className="flex items-center justify-center">
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
          disabled={loading}
          onClick={mintNftHandler}>
          {loading ? (
            <svg
              aria-hidden="true"
              role="status"
              className="inline mr-3 w-4 h-4 text-white animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
          ) : null}
          Mint NFT
        </button>
      </div>
      <div className="mt-10 grid grid-cols-4 gap-4">
        {images.map((image) => (
          <img src={image.image} alt="token image" key={image.image} />
        ))}
      </div>
    </div>
  );
};

export default App;
