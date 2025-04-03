import { ethers } from "ethers";
import axios from "axios";
import contractABI from "../../MixtapeNFT.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY;

// Get the contract instance
export const getContract = async () => {
  if (!window.ethereum) throw new Error("No crypto wallet found. Connect a wallet.");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

// Upload metadata to Pinata
const uploadToPinata = async (title, playlistLink, secretMessage) => {
  try {
    const metadata = {
      title: title,
      playlist: playlistLink,
      secretMessage: secretMessage,
    };

    const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    return response.data.IpfsHash; // Return the CID of the uploaded JSON
  } catch (error) {
    console.error("Pinata upload failed:", error);
    throw new Error("Failed to upload metadata to Pinata.");
  }
};

// Mint a new NFT
export const mintNFT = async (title, playlistLink, secretMessage, recipientAddress) => {
  try {
    const contract = await getContract();

    // Step 1: Upload metadata to Pinata
    console.log("Uploading metadata to Pinata...");
    const metadataCID = await uploadToPinata(title, playlistLink, secretMessage);
    const metadataURI = `ipfs://${metadataCID}`;

    console.log("Metadata uploaded! CID:", metadataCID);

    // Step 2: Estimate gas
    try {
      const estimatedGas = await contract.mintNFT.estimateGas(
        title,
        metadataURI,
        secretMessage,
        recipientAddress
      );
      console.log("Estimated Gas:", estimatedGas.toString());
    } catch (error) {
      console.error("Gas estimation failed, using manual gas limit:", error);
    }

    // Step 3: Mint NFT with metadata URI
    const gasLimit = 500000; // Adjust gas limit if needed
    const tx = await contract.mintNFT(title, metadataURI, secretMessage, recipientAddress, {
      gasLimit: gasLimit,
    });

    await tx.wait();
    console.log("NFT Minted Successfully!");
  } catch (error) {
    console.error("Minting failed:", error);
    throw new Error("Minting failed. Check console for details.");
  }
};
