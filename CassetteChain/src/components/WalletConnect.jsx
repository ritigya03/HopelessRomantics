import { useState } from "react";
import { ethers } from "ethers";

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request accounts from MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Set up ethers.js provider using Web3Provider (v6.x+)
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Get the account address
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        console.log("Connected Account:", address);
      } catch (error) {
        console.error("Wallet connection failed:", error);
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask.");
    }
  };

  const executeTransaction = async () => {
    try {
      if (!isConnected) {
        alert("Please connect your wallet first.");
        return;
      }
      
      // Ensure MetaMask or other provider is available
      if (!window.ethereum) throw new Error("No crypto wallet found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize contract
      const contractAddress = "YOUR_CONTRACT_ADDRESS";
      const abi = ["function someMethod() public"]; // Replace with actual ABI
      const contract = new ethers.Contract(contractAddress, abi, signer);

      // Call contract method with gas limit
      const tx = await contract.someMethod({ gasLimit: 500000 });
      console.log("Transaction sent:", tx.hash);

      // Wait for transaction confirmation
      await tx.wait();
      console.log("Transaction confirmed");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div>
      <h2>Connect Your MetaMask Wallet</h2>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={executeTransaction}>Execute Transaction</button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;