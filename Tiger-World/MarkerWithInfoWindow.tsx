import { Marker, InfoWindow, useMarkerRef } from '@vis.gl/react-google-maps';
import { useEffect, useState, useCallback } from 'react';


interface MarkerProps {
    
    position: {lat: number, lng: number},
    buildingName: string,
    buildingDescription: string,


}


const MarkerWithInfoWindow : React.FC<MarkerProps> = ({position, buildingName, buildingDescription}) => {
  // `markerRef` and `marker` are needed to establish the connection between
  // the marker and infowindow (if you're using the Marker component, you
  // can use the `useMarkerRef` hook instead).
  const [markerRef, marker] = useMarkerRef();

  const [infoWindowShown, setInfoWindowShown] = useState(false);

  // clicking the marker will toggle the infowindow
  const handleMarkerClick = useCallback(
    () => setInfoWindowShown(isShown => !isShown),
    []
  );

  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <Marker
        ref={markerRef}
        position={position}
        onClick={handleMarkerClick}
      />

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose}>
          <h2>{buildingName}</h2>
          <p>{buildingDescription}</p>
        </InfoWindow>
      )}
    </>
  );
};

export default MarkerWithInfoWindow;