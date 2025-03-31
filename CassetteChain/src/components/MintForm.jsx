import { useLocation } from 'react-router-dom';
import playImg from '../assets/Screenshot 2025-03-31 143024.png';
import "../index.css";
import { Link } from 'react-router-dom';
const MintForm = () => {
  const location = useLocation();
  const { name, image } = location.state || {};

  return (
    <div
          className="flex  items-center justify-center min-h-screen bg-cover bg-center p-8"
          style={{ backgroundImage: `url(${playImg})` }}
        >
    <div className="max-w-2xl mt-10 mx-auto p-10 bg-black rounded-lg shadow-pink-900 shadow-lg">
        
      <h2 className="text-2xl text-center font-bold text-white mb-4">Mint and Send NFT</h2>
      <div className="mb-4">
        <img src={image} alt={name} className="w-full rounded-lg" />
        <p className="text-white text-center press-start text-2xl font-bold mt-2">{name}</p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-white mb-1">Recipient Address</label>
          <input 
            type="text" 
            className="w-full p-2 rounded bg-gray-800 text-white" 
            placeholder="0x..." 
          />
        </div>
        <div>
          <label className="block text-white mb-1">Secret Message</label>
          <input 
            type="text" 
            className="w-full p-2 rounded bg-white text-black" 
            placeholder="Hopeless Romantics..." 
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded"
        >
          Mint and Send
        </button>
        
      </form>
     
    </div>
    <Link to="/playlists">
        <button 
        className=" bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all"
    >
        Back
    </button>
    </Link>
    </div>
  );
};

export default MintForm;