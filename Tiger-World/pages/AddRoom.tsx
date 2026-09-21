import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './AddRoom.css';
import { arrowForward } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

const AddRoom: React.FC = () => {

const location = useLocation<any>();

  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [restroom, setRestroom] = useState("");
  const [department, setDepartment] = useState("");
  const [occupant, setOccupant] = useState("");
  const history = useHistory();

  console.log("FULL LOCATION STATE:", location.state);

const handleSubmit = async () => {
  const building = location.state?.building;
  const buildingId = building?.id;

  if (!buildingId || !number || !type) {
    console.error("Missing fields", { buildingId, number, type });
    return;
  }

  const res = await fetch("https://balanced-upliftment-production-fd8f.up.railway.app/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      building_ID: buildingId,
      room_number: number,
      room_classification: type.toUpperCase(),
      occupant: occupant || null,
      department: department || null,
      restroom_type: restroom || null
    })
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("SERVER ERROR:", err);
    return;
  }

  history.push('/tab4', {
    building: building
  });
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="tab4"></IonBackButton>
          </IonButtons>
          <IonTitle>Create Room: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Room list</IonTitle>
          </IonToolbar>
        </IonHeader>

              <IonList inset={false}>

                <IonItem>
                  <IonSelect label="Room Type: " multiple={false} color="tertiary" value={type} onIonChange={e => setType(e.detail.value!)}>
                    <IonSelectOption value="Office">Office</IonSelectOption>
                    <IonSelectOption value="Restroom">Restroom</IonSelectOption>
                    <IonSelectOption value="Classroom">Classroom</IonSelectOption>
                    <IonSelectOption value="Laboratory">Laboratory</IonSelectOption>
                    <IonSelectOption value="Food">Food</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonInput color="tertiary" type="text" label="Enter Room Number: " value={number} onIonChange={e => setNumber(e.detail.value!)}></IonInput>
                </IonItem>

                <IonItem>
                  <IonInput color="tertiary" type="number" label="Enter Floor Number: " value={floor} onIonChange={e => setFloor(e.detail.value!)}></IonInput>
                </IonItem>

              {type === "Restroom" && (
                <IonItem>
                  <IonSelect label="Restroom Type: " multiple={false} color="tertiary" value={restroom} onIonChange={e => setRestroom(e.detail.value!)}>
                    <IonSelectOption value="Women's">Women's</IonSelectOption>
                    <IonSelectOption value="Men's">Men's</IonSelectOption>
                    <IonSelectOption value="Genderless">Genderless</IonSelectOption>
                    <IonSelectOption value="Wheelchair Accessible">Wheelchair Accessible</IonSelectOption>
                  </IonSelect>
                </IonItem>
              )}

              {(type === "Office" || type === "Laboratory") && (
                <IonItem>
                  <IonInput color="tertiary" label="Department: " type="text" value={department} onIonChange={e => setDepartment(e.detail.value!)}></IonInput>
                </IonItem>
              )}

              {type === "Office" && (
                <IonItem>
                  <IonInput color="tertiary" type="text" label="Office Occupant: " value={occupant} onIonChange={e => setOccupant(e.detail.value!)}></IonInput>
                </IonItem>
              )}

              </IonList>

        <div className="ion-margin">
          <IonButton onClick={handleSubmit} color="tertiary">
            <IonLabel>Create </IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default AddRoom;