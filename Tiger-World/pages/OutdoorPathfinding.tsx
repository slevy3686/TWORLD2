import { IonFab, IonIcon, IonFabButton, IonButton } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import './Tab2.css';
import { Marker, useMap, useMapsLibrary, Polyline } from '@vis.gl/react-google-maps';
import { useEffect, useState, useRef } from 'react';
import { Geolocation, Position } from '@capacitor/geolocation'
import { loadEnv } from 'vite'

const mapsApi = import.meta.env.VITE_GOOGLE_MAPS_API;

interface PathfindingProps {
    //This props is used for testing purposes when
    //trying to make sure that the pathfinding works as intended.
    //Just click somewhere on the map and the userPosition will update there.
    //If you want to test out the pathfinding uncomment the userPosition version of the pathfinding and
    //comment out the position version of the pathfinding. Then replace position with userPosition with any
    //component or variable that needs the userPosition.
    userPosition: {lat: number, lng: number};
}

type LatLng = {
  lat: number;
  lng: number;
}

function getDistance(a: LatLng, b:LatLng){
  const R = 6371e3;//meters
  const Phi1 = (a.lat * Math.PI) / 180;
  const Phi2 = (b.lat * Math.PI) / 180;
  const deltaPhi = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLambda = ((b.lng - a.lng) * Math.PI) / 180;

    const x =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(Phi1) *
    Math.cos(Phi2) *
    Math.sin(deltaLambda / 2) *
    Math.sin(deltaLambda / 2);

  const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return R * d;
}

const OutdoorPathfinding: React.FC<PathfindingProps> = ({userPosition}) => {
  const geometry = useMapsLibrary("geometry");
  const lastFetchTime = useRef(0);

  const markerPos1 = {lat: 30.409662781123572, lng: -91.18212244303703};
  const markerPos2 = {lat: 30.410143928242466, lng: -91.17549202235222};

  const [position, setPosition] = useState<LatLng>({lat: 0, lng: 0});
  const [destination] = useState<LatLng>(markerPos2);


  type LatLng = { lat: number; lng: number };

  const [path, setPath] = useState<LatLng[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [isRoutingStarted, setIsRoutingStarted] = useState(false);
  const [isLocationStarted, setIsLocationStarted] = useState(false);
  const lastReroutePoint = useRef<LatLng | null>(null);
  const watchId = useRef<string | null>(null);

  type RouteInfo = {
    distance: number;
    duration: string;
  } | null;


  const handleRoutingStart = () => {
    setIsLocationStarted(true);
    setIsRoutingStarted(true);
    console.log("Routing Start");
  }

  //Tracks the users position 
useEffect(() => {
  if (!isRoutingStarted) return;

  const startTracking = async () => {
    watchId.current = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (pos: Position | null, err) => {
        if (err || !pos) return;

        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setPosition(newPos);
      }
    );
  };

  startTracking();

  return () => {
    if (watchId.current) {
      Geolocation.clearWatch({ id: watchId.current });
    }
  };
}, [isRoutingStarted]);


/////////////////////////////////
//position version of pathfinding
//////////////////////////////////
 useEffect(() => {

  if(!isRoutingStarted) return;
  if(!position || !destination) {console.log("Position or dest null" + position + ", " + destination); return;}
  if(position.lat == 0 && position.lng == 0) return;

      const shouldReroute = () => {
      if (!lastReroutePoint.current) return true;

      const dist = getDistance(position, lastReroutePoint.current);
      console.log("Distance to last Route Point " + dist);
      return dist > 30; 
    };

      const distToDestination = getDistance(position, destination);
      console.log("Distance: " + distToDestination);
      if(distToDestination < 25){ 
        setIsRoutingStarted(false);
        return ;
      }
    

    if(!shouldReroute()) return;
    lastReroutePoint.current = position;

  //Throttle API so we don't go overboard with the calls
  if(Date.now() - lastFetchTime.current < 500) {console.log("Too many calls"); return;}
  lastFetchTime.current = Date.now();

  const getRoute = async () => {

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": mapsApi,
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
          travelMode: "Walk",
        }),
      }
    );

    const data = await response.json();
    const route = data.routes[0];

    console.log(route);
    console.log(route.polyline.encodedPolyline);


  if (!geometry) {
    console.log("Geometry library not loaded");
    return;
  }


  const decodedPath = geometry.encoding.decodePath( 
    route.polyline.encodedPolyline
  );


  const pathCoords = decodedPath.map((point: google.maps.LatLng) => ({
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
}, [position, geometry, isRoutingStarted, destination]);
//////////////////////////////////////////////
//End of position version of the pathfinding
//////////////////////////////////////////////


///////////////////////////////////////////
//userPosition version of the pathfinding
///////////////////////////////////////////
//  useEffect(() => {

//   if(!isRoutingStarted) return;
//   if(!userPosition || !destination) return;

//       const shouldReroute = () => {
//       if (!lastReroutePoint.current) return true;

//       const dist = getDistance(userPosition, lastReroutePoint.current);
//       console.log("Distance to last Route Point " + dist);
//       return dist > 30; // 🔑 threshold (meters)
//     };

//       //Checks if the user arrived at the destination. 
//       //Does nothing for now except for stoping the pathfinding.
//       const distToDestination = getDistance(userPosition, destination);
//       console.log("Distance: " + distToDestination);
//       if(distToDestination < 25){ // (meters)
//         setIsRoutingStarted(false);
//         return ;
//       }
    

//     if(!shouldReroute()) return;
//     lastReroutePoint.current = userPosition;


//   //Throttle API so we don't go overboard with the calls
//   if(Date.now() - lastFetchTime.current < 500) {console.log("Too many calls"); return;}
//   lastFetchTime.current = Date.now();

//   const getRoute = async () => {

//     const response = await fetch(
//       "https://routes.googleapis.com/directions/v2:computeRoutes",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-Goog-Api-Key": "place api here",
//           "X-Goog-FieldMask":
//             "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
//         },
//         body: JSON.stringify({
//           origin: {
//             location: {
//               latLng: { latitude: userPosition.lat, longitude: userPosition.lng },
//             },
//           },
//           destination: {
//             location: {
//               latLng: { "latitude": destination.lat, "longitude": destination.lng },
//             },
//           },
//           travelMode: "Walk",
//         }),
//       }
//     );

//     const data = await response.json();
//     const route = data.routes[0];

//     console.log(route);
//     console.log(route.polyline.encodedPolyline);

//     // Decode polyline 
//     const decodedPath = geometry.encoding.decodePath(
//       route.polyline.encodedPolyline
//     );

//     // Convert to plain lat/lng objects
//     const pathCoords = decodedPath.map((point) => ({
//       lat: point.lat(),
//       lng: point.lng(),
//     }));

//     setPath(pathCoords);
//     setRouteInfo({
//       distance: route.distanceMeters,
//       duration: route.duration,
//     });


//   }
//   getRoute();
// }, [geometry, isRoutingStarted, destination, userPosition]);
/////////////////////////////////////////////////
//End of userPosition version of the pathfinding
////////////////////////////////////////////////
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

              <IonButton onClick={handleRoutingStart}>
                <IonIcon icon={locationOutline}></IonIcon>
                <p>Go</p>
              </IonButton>
            <IonFab vertical="center" horizontal="start" slot="fixed">

            </IonFab>
        </>
         
  );
};

export default OutdoorPathfinding;
