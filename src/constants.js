const CONTRACT_ADDRESS = '0x705daCDb37533a474314AE0A136F5838E36D8f0f';

const transformInstrumentData = (instrumentData) => {
  return {
    name: instrumentData.name,
    imageURI: instrumentData.imageURI,
    volume: instrumentData.volume.toNumber(),
    notes: instrumentData.notes.toNumber(),
    size: instrumentData.size.toNumber(),
  };
};

export { CONTRACT_ADDRESS, transformInstrumentData };

