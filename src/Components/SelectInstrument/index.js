import React, { useEffect, useState } from 'react';
import './SelectInstrument.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformInstrumentData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

/*
 * Don't worry about setInstrumentNFT just yet, we will talk about it soon!
 */
const SelectInstrument = ({ setInstrumentNFT }) => {
  const [instruments, setInstruments] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  useEffect(() => {
    const getInstruments = async () => {
      try {
        console.log('Getting contract instruments to mint');
  
        /*
         * Call contract to get all mint-able intruments
         */
        const intrumentsTxn = await gameContract.getAllDefaultInstruments();
        console.log('instrumentTxn:', intrumentsTxn);
  
        /*
         * Go through all of our intruments and transform the data
         */
        const instruments = intrumentsTxn.map((instrumentData) =>
          transformInstrumentData(instrumentData)
        );
  
        /*
         * Set all mint-able intruments in state
         */
        setInstruments(instruments);
      } catch (error) {
        console.error('Something went wrong fetching instruments:', error);
      }
    };
  
    const onInstrumentMint = async (sender, tokenId, instrumentIndex) => {
      console.log(
        `InstrumentNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} instrumentIndex: ${instrumentIndex.toNumber()}`
      );
  
      /*
       * Once our instrument NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      if (gameContract) {
        const instrumentNFT = await gameContract.checkIfUserHasNFT();
        console.log('instrumentNFT: ', instrumentNFT);
        alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)

        setInstrumentNFT(transformInstrumentData(instrumentNFT));
      }
    };
  

    /*
     * If our gameContract is ready, let's get instruments!
     */
    if (gameContract) {
      getInstruments();

      gameContract.on('InstrumentNFTMinted', onInstrumentMint);

    }

    return () => {
      /*
       * When your component unmounts, let;s make sure to clean up this listener
       */
      if (gameContract) {
        gameContract.off('InstrumentNFTMinted', onInstrumentMint);
      }
    };
  
  }, [gameContract, setInstrumentNFT]);
  

  // UseEffect
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

      /*
      * This is the big difference. Set our gameContract in state.
      */
      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  // Actions
  const mintInstrumentNFTAction = (instrumentId) => async () => {
    try {
      if (gameContract) {
        console.log('Minting instrument in progress...');
        const mintTxn = await gameContract.mintInstrumentNFT(instrumentId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
      }
    } catch (error) {
      console.warn('MintInstrumentAction Error:', error);
    }
  };


  const renderInstruments = () =>
  instruments.map((instrument, index) => (
    <div className="instrument-item" key={instrument.name}>
      <div className="name-container">
        <p>{instrument.name}</p>
      </div>
      <img src={instrument.imageURI} alt={instrument.name} />
      <button
        type="button"
        className="instrument-mint-button"
        onClick={mintInstrumentNFTAction(index)}
      >{`Mint ${instrument.name}`}</button>
    </div>
  ));

  return (
    <div className="select-instrument-container">
      <h2>Mint Your Instrument. Choose wisely.</h2>
      {/* Only show this when there are instruments in state */}
      {instruments.length > 0 && (
        <div className="instrument-grid">{renderInstruments()}</div>
      )}
    </div>
  );
  
};

export default SelectInstrument;
