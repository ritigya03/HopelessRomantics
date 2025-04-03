import { useState } from "react";
import { getNFTMetadata } from "../../NFTContract";

const NFTDisplay = () => {
  const [tokenId, setTokenId] = useState("");
  const [nftData, setNftData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNFT = async () => {
    if (!tokenId) return alert("Enter a valid Token ID!");

    setLoading(true);
    const metadata = await getNFTMetadata(tokenId);
    setNftData(metadata);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-bold">Fetch Your NFT</h2>
      <input
        type="number"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        placeholder="Enter Token ID (e.g. 1)"
        className="p-2 border rounded mt-2"
      />
      <button onClick={fetchNFT} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        {loading ? "Fetching..." : "Get NFT Data"}
      </button>

      {nftData && (
        <div className="mt-4 p-4 border rounded shadow-lg">
          <h3 className="text-lg font-bold">{nftData.name}</h3>
          <img src={nftData.image} alt={nftData.name} className="w-40 h-40 rounded mt-2" />
          <p className="mt-2">Message: {nftData.message}</p>
          <p>Date: {new Date(nftData.date).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default NFTDisplay;
