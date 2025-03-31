import { useNavigate } from 'react-router-dom';

const Card = ({ name, url, image }) => {
  const navigate = useNavigate();

  const handleMintClick = () => {
    navigate('/mint-form', { 
      state: { 
        name, 
        image 
      } 
    });
  };

  return (
    <div className="bg-black p-8 rounded-xl shadow-pink-900 shadow-lg w-[350px] text-center transition-transform transform hover:scale-105">
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <img className="mt-5" src={image} alt="" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-500 hover:underline mt-2 block"
      >
        Open on Spotify
      </a>
      <button 
        onClick={handleMintClick}
        className="text-white text-xl  mt-2"
      >
        Mint and Send
      </button>
    </div>
  );
};

export default Card;