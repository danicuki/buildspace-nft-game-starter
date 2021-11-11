import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformInstrumentData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';

/*
 * We pass in our instrumentNFT metadata so we can a cool card in our UI
 */
const Arena = ({ instrumentNFT, setInstrumentNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [playState, setPlayState] = useState('');
  const [showToast, setShowToast] = useState(false);

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log('Boss:', bossTxn);
      setBoss(transformInstrumentData(bossTxn));
    }

    const onPlayComplete = (newBossVol, newPlayerVol) => {
      const bossVol = newBossVol.toNumber();
      const playerVol = newPlayerVol.toNumber();

      console.log(`AttackComplete: Boss Vol: ${bossVol} Player Vol: ${playerVol}`);

      /*
      * Update both player and boss Hp
      */
      setBoss((prevState) => {
          return { ...prevState, volume: bossVol };
      });

      setInstrumentNFT((prevState) => {
          return { ...prevState, volume: playerVol };
      });
    };


    if (gameContract) {
      /*
       * gameContract is ready to go! Let's fetch our boss
       */
      fetchBoss();
      gameContract.on('PlayComplete', onPlayComplete);

    }
  
    return () => {
      if (gameContract) {
          gameContract.off('PlayComplete', onPlayComplete);
      }
    }

  }, [gameContract, setInstrumentNFT])

  const runPlayAction = async () => {
    try {
      if (gameContract) {
        setPlayState('playing');
        console.log('Playing to the boss...');
        const playTxn = await gameContract.playToBoss();
        await playTxn.wait();
        console.log('playTxn:', playTxn);
        setPlayState('played');

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);  
      }
    } catch (error) {
      console.error('Error playing to the boss:', error);
      setPlayState('');
    }
  
  };

  return (
    <div className="arena-container">
      {/* Add your toast HTML right here */}
      {boss && instrumentNFT && (
      <div id="toast" className={showToast ? 'show' : ''}>
        <div id="desc">{`💥 ${boss.name} volume was reduced ${instrumentNFT.notes} levels!`}</div>
      </div>
      )}

      {/* Replace your Boss UI with this */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${playState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.volume} max='255' />
                <p>{`${boss.volume} / 255 VOL`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runPlayAction}>
              {`🎵 Play to ${boss.name}`}
            </button>
          </div>
          {playState === 'playing' && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Playing 🎵</p>
            </div>
          )}

        </div>
      )}
  
      {instrumentNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Instrument</h2>
            <div className="player">
              <div className="image-content">
                <h2>{instrumentNFT.name}</h2>
                <img
                  src={instrumentNFT.imageURI}
                  alt={`Instrument ${instrumentNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={instrumentNFT.volume} max='255' />
                  <p>{`${instrumentNFT.volume} / 255 VOL`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`Play Notes: ${instrumentNFT.notes}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}    
    </div>
  );
  };

export default Arena;
