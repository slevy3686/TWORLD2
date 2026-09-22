import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Tab4.css';
import { add, trash } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import { useHistory, useLocation } from 'react-router';

const Tab4: React.FC = () => {
  const location = useLocation<any>();
  const building = location.state?.building;
  const [rooms, setRooms] = useState<any[]>([]);
  const history = useHistory();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('rooms') || '[]');
    setRooms(stored);
  }, []);

useIonViewWillEnter(() => {
  const buildingId = location.state?.building?.id;

  if (!buildingId) return;

  const fetchRooms = async () => {
    const res = await fetch(
      `http://localhost:3000/api/rooms?building_id=${buildingId}`
    );
    const data = await res.json();

    console.log("ROOMS:", data);

    setRooms(data.rooms || []);
  };

  fetchRooms();
});

  const deleteRoom = (indexToDelete: number) => {
    const updated = rooms.filter((_, index) => index !== indexToDelete);
    setRooms(updated);
    localStorage.setItem('rooms', JSON.stringify(updated));
  };

  const roomSorted = rooms.reduce((acc: any, room: any, originalIndex: number) => {
    const type = room.room_classification || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push({ ...room, originalIndex });
    return acc;
  }, {});

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons color="tertiary" slot="start">
            <IonBackButton defaultHref="tab2"></IonBackButton>
          </IonButtons>
          <IonTitle>Inside: Patrick F. Taylor</IonTitle>
        </IonToolbar>
      </IonHeader>
    <IonContent fullscreen>

{rooms.length === 0 ? (
  <IonItem>
    <IonLabel>There are no rooms added to this building.</IonLabel>
  </IonItem>
) : (
  Object.keys(roomSorted).map((type) => (
    <IonList key={type}>
      <IonListHeader>
        <IonLabel>
          <h1>{type}</h1>
        </IonLabel>
      </IonListHeader>

      {roomSorted[type].map((room: any) => (
        <IonItem key={room.room_ID}>
          <IonLabel>
            <h2>Room {room.room_number}</h2>

            {room.occupant && <p>{room.occupant}</p>}
            {room.department && <p>{room.department}</p>}
            {room.restroom_type && <p>{room.restroom_type}</p>}
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  ))
)}

        <div className="ion-margin">

        <IonButton
          color="tertiary"
          onClick={() =>
            history.push('/addroom', {
              building: building
            })
          }
        >
          <IonLabel>Add Room</IonLabel>
          <IonIcon icon={add} />
        </IonButton>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab4;