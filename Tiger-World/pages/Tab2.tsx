import { IonButton, IonContent, IonFab, IonIcon, IonItem, IonLabel, IonList, IonPage, IonPopover, IonSearchbar } from '@ionic/react';
import './Tab2.css';
import { arrowForward, calendar, help, locationOutline, pencil, settings } from 'ionicons/icons';
import { Polyline, APIProvider, useMapsLibrary, Map, ControlPosition, MapMouseEvent, Marker } from '@vis.gl/react-google-maps';
import { useHistory, useLocation } from 'react-router';
import { useEffect, useState } from 'react';
import { Building } from './types';
import MapsComponents from './MapsComponents';
import OutdoorPathfinding from './OutdoorPathfinding';
import { Geolocation } from '@capacitor/geolocation';
const mapsApi = import.meta.env.VITE_GOOGLE_MAPS_API;

declare global {
  interface Window {
    google: any;
  }
}

const Tab2: React.FC = () => {
  const location = useLocation<any>();
  const selected = location.state;

  const history = useHistory();
  
  const selectingLocation = location.state?.selectingLocation;
  
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  const [expanded, setExpanded] = useState(false);

  const [searchText, setSearchText] = useState('');
  

  const [userPos, setUserPos] = useState({
    lat: 30.406266,
    lng: -91.184324
  });

  const filteredBuildings = buildings.filter(b =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const getUserLocation = async () => {
  try {
    const permission = await Geolocation.requestPermissions();

    if (permission.location !== "granted") {
      console.log("Location permission denied");
      return;
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
    });

    setUserPos({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });

  } catch (err) {
    console.log("Failed to get location:", err);
  }
};
  
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch("https://balanced-upliftment-production-fd8f.up.railway.app/api/buildings");

        const data = await res.json();

        const normalized: Building[] = data.buildings.map((b: any) => ({
          id: b.building_ID,
          name: b.building_name,
          address: b.address,
          phone: b.phone,
          lat: b.lat,
          lng: b.lng,

          mondayOpen: b.monday_open,
          mondayClose: b.monday_close,
          tuesdayOpen: b.tuesday_open,
          tuesdayClose: b.tuesday_close,
          wednesdayOpen: b.wednesday_open,
          wednesdayClose: b.wednesday_close,
          thursdayOpen: b.thursday_open,
          thursdayClose: b.thursday_close,
          fridayOpen: b.friday_open,
          fridayClose: b.friday_close,
          saturdayOpen: b.saturday_open,
          saturdayClose: b.saturday_close,
          sundayOpen: b.sunday_open,
          sundayClose: b.sunday_close
        }));

        setBuildings(normalized);
      } catch (err) {
        console.error('Failed to fetch buildings:', err);
      }
    };

    fetchBuildings();
  }, []);

useEffect(() => {
  const getLocation = async () => {
    const pos = await Geolocation.getCurrentPosition();
    setUserPos({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    });
  };

  getLocation();
}, []);

  const handleMapClick = (e: MapMouseEvent) => {
    if (!e.detail.latLng) return;

    const lat = e.detail.latLng.lat;
    const lng = e.detail.latLng.lng;

    console.log('Clicked:', lat, lng);

    setUserPos({ lat, lng });

    if (selectingLocation) {
      history.push('/addbuilding', { lat, lng });
    }
  };

  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
  };



const geometry = useMapsLibrary("geometry");
const [path, setPath] = useState<any[]>([]);
const [isRouting, setIsRouting] = useState(false);

const destination = selectedBuilding
  ? { lat: Number(selectedBuilding.lat), lng: Number(selectedBuilding.lng) }
  : null;

const startRoute = async () => {
  console.log("Routing Start");

  if (!selectedBuilding) {
    console.log("No destination selected");
    return;
  }

  const geometry = window.google?.maps?.geometry;
  if (!geometry) {
    console.log("Geometry not loaded");
    return;
  }

  let pos;

  try {
    pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    });
  } catch (err) {
    console.log("GPS failed, using fallback", err);
    return;
  }

  const origin = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };

  const destination = {
    lat: Number(selectedBuilding.lat),
    lng: Number(selectedBuilding.lng),
  };

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyBEt2zDtjYZ9PKc1E4oEti5o4_2mDBiPsI",
        "X-Goog-FieldMask":
          "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
      },
  body: JSON.stringify({
    origin: {
      location: {
        latLng: {
          latitude: origin.lat,
          longitude: origin.lng,
        },
      },
    },
    destination: {
      location: {
        latLng: {
          latitude: destination.lat,
          longitude: destination.lng,
        },
      },
    },
    travelMode: "WALK",
    routingPreference: "ROUTING_PREFERENCE_UNSPECIFIED",
  })
      }
    );

const data = await response.json();

console.log("FULL ROUTE RESPONSE:", data);

if (!response.ok) {
  console.error("Routes API failed:", data);
  return;
}

  console.log("Google response:", data);

  if (!data.routes?.length) {
    console.log("No routes returned:", data);
    return;
  }

  const route = data.routes[0];

  if (!geometry) return;

  const decoded = geometry.encoding.decodePath(
    route.polyline.encodedPolyline
  );

  const pathCoords = decoded.map((p: any) => ({
    lat: p.lat(),
    lng: p.lng(),
  }));

  setPath(pathCoords);
};



  return (
    <IonPage>
      <IonContent fullscreen>

        <IonFab vertical="top" horizontal="center" slot="fixed">
          <IonSearchbar
            color="tertiary"
            placeholder="Search by Location..."
            value={searchText}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            onIonClear={() => setSearchText('')}
          />
          {searchText && filteredBuildings.length > 0 && (
            <IonList className="search-dropdown">
              {filteredBuildings.map(b => (
                <IonItem
                  key={b.id}
                  button
                  onClick={() => {
                    setSelectedBuilding(b);
                    setSearchText('');
                  }}
                >
                  <IonLabel>{b.name}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}
          
        <div className="ion-padding">
          <IonButton href="settings" color="tertiary" size="small">
            <IonIcon icon={settings}></IonIcon>
          </IonButton>

          <IonButton href="calendar" color="tertiary" size="small">
            <IonIcon icon={calendar}></IonIcon>
          </IonButton>

          <IonButton href="addbuilding" color="tertiary" size="small">
            <IonIcon icon={pencil}></IonIcon>
          </IonButton>

          <IonButton onClick={startRoute} color="tertiary" size="small">
            <IonIcon icon={locationOutline} />
          </IonButton>
          
          <IonButton id="click-trigger" color="tertiary" size="small">
            <IonIcon icon={help}></IonIcon>
          </IonButton>

          <IonButton size="small" onClick={getUserLocation} color="tertiary">
            <IonLabel>Use My Location</IonLabel>
          </IonButton>
          
          <IonPopover trigger="click-trigger" triggerAction="click">
            <IonContent class="ion-padding">Click on a marker to view details. Click the marker button to find a route to the selected location.</IonContent>
          </IonPopover>
          </div>
        </IonFab>
      

        <APIProvider apiKey={'AIzaSyBEt2zDtjYZ9PKc1E4oEti5o4_2mDBiPsI'}>
          <Map
            defaultZoom={18}
            center={
              selectedBuilding
                ? {
                    lat: Number(selectedBuilding.lat),
                    lng: Number(selectedBuilding.lng)
                  }
                : userPos
            }
            onClick={handleMapClick}
            zoomControl={true}
            zoomControlOptions={{
              position: ControlPosition.RIGHT_CENTER
            }}

            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            rotateControl={false}
          >
            <Polyline
              path={path}
              strokeColor="#9900ff"
              strokeWeight={5}
            />
            {buildings.map((b) => (
              <Marker
                key={b.id}
                position={{
                  lat: Number(b.lat),
                  lng: Number(b.lng)
                }}
                onClick={() => handleSelectBuilding(b)}
              />
            ))}

            <Marker position={userPos} />

            <MapsComponents userPosition={userPos} />

          </Map>
        </APIProvider>
         
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            {selectedBuilding && (
              <div className={`fab-card ${expanded ? 'expanded' : ''}`}>
                <IonButton color="tertiary" fill="clear" size="small" onClick={() => setExpanded(prev => !prev)}>
                  <IonLabel>{expanded ? 'Show Less' : 'Show More'}</IonLabel>
                </IonButton>
                <IonLabel><h1>{selectedBuilding.name}</h1></IonLabel>
                  <IonLabel><p>{selectedBuilding.address}</p></IonLabel>
                  <IonLabel><p>Phone: {selectedBuilding.phone}</p></IonLabel>
                  <IonList inset={false}>
                    <div className="ion-margin">
                    <IonLabel> Hours: </IonLabel>
                      <IonLabel><p>Mon: {selectedBuilding?.mondayOpen} - {selectedBuilding?.mondayClose}</p></IonLabel>
                      <IonLabel><p>Tues: {selectedBuilding?.tuesdayOpen} - {selectedBuilding?.tuesdayClose}</p></IonLabel>
                      <IonLabel><p>Wed: {selectedBuilding?.wednesdayOpen}- {selectedBuilding?.wednesdayClose}</p></IonLabel>
                      <IonLabel><p>Thurs: {selectedBuilding?.thursdayOpen}- {selectedBuilding?.thursdayClose}</p></IonLabel>
                      <IonLabel><p>Fri: {selectedBuilding?.fridayOpen}- {selectedBuilding?.fridayClose}</p></IonLabel>
                      <IonLabel><p>Sat: {selectedBuilding?.saturdayOpen}- {selectedBuilding?.saturdayClose}</p></IonLabel>
                      <IonLabel><p>Sun: {selectedBuilding?.sundayOpen}- {selectedBuilding?.sundayClose}</p></IonLabel>
                    </div>
                  </IonList>
                <IonButton
                  onClick={() => history.push('/tab4', { building: selectedBuilding })}
                  color="tertiary"
                >
                <IonLabel>See Inside...</IonLabel>
                <IonIcon icon={arrowForward}></IonIcon>
              </IonButton>
            </div>
          )}
          </IonFab>


      </IonContent>
    </IonPage>
  );
};

export default Tab2;
