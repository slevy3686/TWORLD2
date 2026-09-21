import { IonButton, IonContent, IonFab, IonIcon, IonLabel, IonPage, IonPopover, IonSearchbar, IonFabButton } from '@ionic/react';
import { add, locateOutline, locationOutline } from 'ionicons/icons';
import './Tab2.css';
import { arrowForward, calendar, help, pencil, settings } from 'ionicons/icons';
import { APIProvider,  Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useLocation } from 'react-router';
import { Marker, MapMouseEvent, useMap, useMapsLibrary, Polyline } from '@vis.gl/react-google-maps';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation'


interface PathfindingProps {
    userPosition: {lat: number, lng: number};
}

// type LatLng = {
//   lat: number;
//   lng: number;
// }

// function getDistance(a: LatLng, b:LatLng){
//   const R = 6371e3;//meters
//   const Phi1 = (a.lat * Math.PI) / 180;
//   const Phi2 = (b.lat * Math.PI) / 180;
//   const deltaPhi = ((b.lat - a.lat) * Math.PI) / 180;
//   const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180;

//     const x =
//     Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
//     Math.cos(Phi1) *
//     Math.cos(Phi2) *
//     Math.sin(deltaLambda / 2) *
//     Math.sin(deltaLambda / 2);

//   const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

//   return R * d;
// }

const OutsidePathfinding: React.FC<PathfindingProps> = ({userPosition}) => {

  const map = useMap();
  const geometry = useMapsLibrary("geometry");
  const lastFetchTime = useRef(0);

  const markerPos1 = {lat: 30.409662781123572, lng: -91.18212244303703};
  const markerPos2 = {lat: 30.410143928242466, lng: -91.17549202235222};

  const [position, setPosition] = useState({lat: 30.409662781123572, lng: -91.18212244303703});
  const [isPathButtonDisabled, setIsPathButtonDisabled] = useState(true);
  const [destination, setDestination] = useState(markerPos2);


  type LatLng = { lat: number; lng: number; };

  type RouteInfo = { distance: number; duration: string; } | null;

  const [path, setPath] = useState<LatLng[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [isRoutingStarted, setIsRoutingStarted] = useState(false);
  const [isLocationStarted, setIsLocationStarted] = useState(false);


  const handleRoutingStart = () => {
    setIsLocationStarted(true);
    setIsRoutingStarted(true);
    console.log("Routing Start");
  }




useEffect (() => {
  // console.log("use effect location");
  // if(!isLocationStarted) return;
  
  const getLocation = async  () => {
        console.log("Getting Location");
        try {
        const coords = await Geolocation.getCurrentPosition();
        setPosition({
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
        });


      } catch (err) {
        console.error("Error getting location", err);
      }
  }
  getLocation();

}, [isLocationStarted])


 useEffect(() => {

  if(!isRoutingStarted) return;
  //Throttle API so we don't go overboard with the calls
  if(Date.now() - lastFetchTime.current < 5000) {console.log("Too many calls wait a few seconds"); return;}
  lastFetchTime.current = Date.now();

  const getRoute = async () => {

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": "api here",
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify({
          origin: {
            location: {
              latLng: { latitude: position.lat, longitude: position.lng },
            },
          },
          destination: {
            location: {
              latLng: { "latitude": destination.lat, "longitude": destination.lng },
            },
          },
          travelMode: "DRIVE"
        }),
      }
    );

  const data = await response.json();

  console.log("FULL ROUTE RESPONSE:", data);

  if (!data.routes || data.routes.length === 0) {
    console.log("No routes returned");
    return;
  }

  const route = data.routes[0];

    console.log(route);
    console.log(route.polyline.encodedPolyline);

  if (!geometry) {
    console.log("Geometry library not loaded yet");
    return;
  }

  const decodedPath = geometry.encoding.decodePath(
    route.polyline.encodedPolyline
  );

    const pathCoords = decodedPath.map((point) => ({
      lat: point.lat(),
      lng: point.lng(),
    }));

    setPath(pathCoords);
    setRouteInfo({
      distance: route.distanceMeters,
      duration: route.duration,
    });


  }
  getRoute();
  setIsRoutingStarted(false);
}, [position, geometry, isRoutingStarted, destination]);
   
  return (
        <>
              <Marker position={position}></Marker>
              <Marker position={destination}></Marker>
              <Polyline 
                path={path}
                strokeColor='#9900ff'
                strokeWeight={5}
              >
              </Polyline>

            <IonFab vertical="center" horizontal="start" slot="fixed">

            </IonFab>
        </>
         
  );
};

export default OutsidePathfinding;
