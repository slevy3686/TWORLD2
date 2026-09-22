import { IonBackButton, IonButton, IonButtons, IonContent, IonDatetime, IonFab, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import './Edit.css';
import { arrowBack, arrowForward, eye, lockClosed } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Edit: React.FC = () => {

  const [title, setTitle] = useState('');
  const [days, setDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');

  const handleCreate = () => {
    const newClass = {
      title, days, startTime, endTime, building, room
    };
    
    const existing = JSON.parse(localStorage.getItem('classes') || '[]');
    existing.push(newClass);

    localStorage.setItem('classes', JSON.stringify(existing));
    history.push('/calendar');
  };

  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="calendar"></IonBackButton>
          </IonButtons>
          <IonTitle>Create Class: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <IonInput fill="solid" color="tertiary" label="Enter Class Title: " value={title} onIonChange={(e) => setTitle(e.detail.value!)}></IonInput>

        <IonSelect fill="solid" label="Enter Class Days: " multiple={true} color="tertiary" value={days} onIonChange={(e) => setDays(e.detail.value)}>
            <IonSelectOption value="Monday">Monday</IonSelectOption>
            <IonSelectOption value="Tuesday">Tuesday</IonSelectOption>
            <IonSelectOption value="Wednesday">Wednesday</IonSelectOption>
            <IonSelectOption value="Thursday">Thursday</IonSelectOption>
            <IonSelectOption value="Friday">Friday</IonSelectOption>
            <IonSelectOption value="Saturday">Saturday</IonSelectOption>
            <IonSelectOption value="Sunday">Sunday</IonSelectOption>
        </IonSelect>

        <IonItem>
          <IonInput label="Start Time: " color="tertiary" type="time" value={startTime} onIonChange={(e) => setStartTime(e.detail.value!)}><span slot="title">Enter Start Time:</span></IonInput>
          <IonInput label="End Time: " color="tertiary" type="time" value={endTime} onIonChange={(e) => setEndTime(e.detail.value!)}><span slot="title">Enter End Time:</span></IonInput>
        </IonItem>

        <IonInput fill="solid" color="tertiary" label="Enter Building: " placeholder="Type here" value={building} onIonChange={(e) => setBuilding(e.detail.value!)}></IonInput>
        <IonInput fill="solid" color="tertiary" label="Enter Room Number: " placeholder="Type here" value={room} onIonChange={(e) => setRoom(e.detail.value!)}></IonInput>

        <div className="ion-margin">
          <IonButton onClick={handleCreate} color="tertiary">
            <IonLabel>Create</IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default Edit;
