import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import './EditEvents.css';
import { arrowBack, arrowForward } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router';

const EditEvents: React.FC = () => {
  const[title, setTitle] = useState('');
  const[start, setStart] = useState('');
  const[date, setDate] = useState('');
  const[end, setEnd] = useState('');
  const[building, setBuilding] = useState('');
  const[room, setRoom] = useState('');

  const handleCreate = () => {
      const newClass = {
        title, date, start, end, building, room
      };
      
      const existing = JSON.parse(localStorage.getItem('events') || '[]');
      existing.push(newClass);
  
      localStorage.setItem('events', JSON.stringify(existing));
      history.push('/events');
    };
  
    const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="events"></IonBackButton>
          </IonButtons>
          <IonTitle>Add Event: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <IonInput
          color="tertiary"
          label="Enter Event Name: "
          placeholder="Type here"
          fill="solid"
          value={title}
          onIonChange={(e) => setTitle(e.detail.value!)}
        ></IonInput>

        <IonInput 
          color="tertiary"
          label="Enter Date: "
          fill="solid"
          type="date"
          value={date}
          onIonChange={(e) => setDate(e.detail.value!)}>
        </IonInput>

        <IonItem>
          <IonInput
            label="Start Time: "
            color="tertiary"
            type="time"
            value={start}
            onIonChange={(e) => setStart(e.detail.value!)}
          ></IonInput>
          <IonInput
            label="End Time: "
            color="tertiary"
            type="time"
            value={end}
            onIonChange={(e) => setEnd(e.detail.value!)}
          ></IonInput>
        </IonItem>

        <IonInput
          color="tertiary"
          label="Enter Building: "
          placeholder="Type here"
          fill="solid"
          value={building}
          onIonChange={(e) => setBuilding(e.detail.value!)}
        ></IonInput>

        <IonInput
          color="tertiary"
          label="Enter Room: "
          placeholder="Type here"
          fill="solid"
          value={room}
          onIonChange={(e) => setRoom(e.detail.value!)}
        ></IonInput>

        <div className="ion-margin">
        <IonButton color="tertiary" onClick={handleCreate}>
          <IonLabel>Enter</IonLabel>
          <IonIcon icon={arrowForward}></IonIcon>
        </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default EditEvents;
