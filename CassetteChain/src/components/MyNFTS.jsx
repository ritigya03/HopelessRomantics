import React, { useEffect, useState } from "react";
import { getUserNFTs } from "../utils/blockchain";

const MyNFTs = ({ walletAddress }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Error state for better UX

  useEffect(() => {
    const fetchNFTs = async () => {
      if (walletAddress) {
        try {
          setLoading(true); // Start loading
          const userNFTs = await getUserNFTs(walletAddress);
          setNfts(userNFTs);
        } catch (error) {
          console.error("Error fetching NFTs:", error);
          setError("Failed to fetch NFTs. Please try again later.");
        } finally {
          setLoading(false); // Stop loading
        }
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  return (
    <div>
      <h2>🎵 My Minted Mixtapes</h2>
      {loading ? (
        <p>Loading your NFTs...</p>
      ) : error ? (
        <p>{error}</p>
      ) : nfts.length === 0 ? (
        <p>No NFTs found.</p>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="nft-card">
              {nft.tokenURI ? (
                <img
                  src={`https://ipfs.io/ipfs/${nft.tokenURI}`}
                  alt={`Mixtape ${nft.tokenId}`}
                />
              ) : (
                <p>Image not available</p> // Fallback for missing tokenURI
              )}
              <p>Token ID: {nft.tokenId}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTs;
