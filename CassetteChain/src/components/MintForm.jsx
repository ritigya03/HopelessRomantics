import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import playImg from '../assets/Screenshot 2025-03-31 143024.png';
import "../index.css";
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

const MintForm = () => {
  const location = useLocation();
  const { name, image } = location.state || {};

  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMint = async (e) => {
    e.preventDefault();
  
    // ... (keep validations)
  
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Updated ABI to match EXACT contract function
      const abi = [
        "function mintMixtape(address recipient, string memory tokenURI) public onlyOwner returns (uint256)"
      ];
  
      const contract = new ethers.Contract(
        "0xD2d8f11d60B578F86De6d788b931cb1D9197c5Bc",
        abi,
        signer
      );
  
      // Prepare metadata (replace with your IPFS logic)
      const metadata = {
        name: name,
        image: image,
        message: message,
        date: new Date().toISOString()
      };
  
      // Call with ALL required parameters and manual gas
      const tx = await contract.mintMixtape(
        recipient,
        JSON.stringify(metadata), 
        { gasLimit: 10000000 }
      );
      
  
      await tx.wait();
      alert("Minted successfully!");
    } catch (error) {
      console.error("Full error:", error);
      
      if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        alert("Minting failed - check contract requirements. Common issues:\n" +
              "1. Are you the contract owner?\n" +
              "2. Are all parameters correct?\n" +
              "3. Is recipient address valid?");
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center p-8" style={{ backgroundImage: `url(${playImg})` }}>
      <div className="max-w-2xl mt-10 mx-auto p-10 bg-black rounded-lg shadow-pink-900 shadow-lg">
        <h2 className="text-2xl text-center font-bold text-white mb-4">Mint and Send NFT</h2>
        <div className="mb-4">
          <img src={image} alt={name} className="w-full rounded-lg" />
          <p className="text-white text-center press-start text-2xl font-bold mt-2">{name}</p>
        </div>

        <form onSubmit={handleMint} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Recipient Address</label>
            <input 
              type="text" 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white" 
              placeholder="0x..." 
            />
          </div>
          <div>
            <label className="block text-white mb-1">Secret Message</label>
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 rounded bg-white text-black" 
              placeholder="Hopeless Romantics..." 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? "Minting..." : "Mint and Send"}
          </button>
        </form>

        {transactionHash && (
          <p className="text-white mt-4">
            Transaction Hash: 
            <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" className="text-pink-400">View on Etherscan</a>
          </p>
        )}

        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      </div>

      <Link to="/playlists">
        <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all">
          Back
        </button>
      </Link>
    </div>
  );
};

export default MintForm;
