import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonPage, IonRow, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import './AddBuilding.css';
import { add, arrowForward } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { usePhotoGallery } from '../hooks/useCamera';
import { useIonRouter } from '@ionic/react';
import { useLocation, useHistory } from 'react-router';

const AddBuilding: React.FC = () => {
  const { photos, addNewToGallery } = usePhotoGallery();
  const [campuses, setCampuses] = useState<any[]>([]);
  const [campusName, setCampusName] = useState('');
  const [name, setName] = useState('');
  const [campusID, setCampusID] = useState('');
  const location = useLocation<any>();
  const router = useIonRouter();
  const history = useHistory();

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [days, setDays] = useState<string[]>([]);
  const [mondayOpen, setMondayOpen] = useState('')
  const [mondayClose, setMondayClose] = useState('');
  const [tuesdayOpen, setTuesdayOpen] = useState('')
  const [tuesdayClose, setTuesdayClose] = useState('');
  const [wednesdayOpen, setWednesdayOpen] = useState('')
  const [wednesdayClose, setWednesdayClose] = useState('');
  const [thursdayOpen, setThursdayOpen] = useState('')
  const [thursdayClose, setThursdayClose] = useState('');
  const [fridayOpen, setFridayOpen] = useState('')
  const [fridayClose, setFridayClose] = useState('');
  const [saturdayOpen, setSaturdayOpen] = useState('')
  const [saturdayClose, setSaturdayClose] = useState('');
  const [sundayOpen, setSundayOpen] = useState('')
  const [sundayClose, setSundayClose] = useState('');

  
  const handleSubmit = async () => {
  if (lat === null || lng === null) {
    alert("Please select a location");
    return;
  }

  try {
    const buildingRes = await fetch("https://balanced-upliftment-production-fd8f.up.railway.app/api/insert/building", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        campus_ID: campusID,
        building_name: name,
        lat: lat,
        lng: lng,
        address: address,
        phone: phone,
        days: days,
        mondayOpen,
        mondayClose,
        tuesdayOpen,
        tuesdayClose,
        wednesdayOpen,
        wednesdayClose,
        thursdayOpen,
        thursdayClose,
        fridayOpen, 
        fridayClose,
        saturdayOpen,
        saturdayClose,
        sundayOpen,
        sundayClose
      })
    });

    const data = await buildingRes.json();
    console.log("Created:", data);

    router.push('/tab2');

  } catch (err) {
    console.error("Error:", err);
  }
};

useEffect(() => {
  const fetchCampuses = async () => {
    try {
      const res = await fetch("https://balanced-upliftment-production-fd8f.up.railway.app/api/insert/campus");
      const data = await res.json();
      setCampuses(data.campuses);
    } catch (err) {
      console.error("Failed to load campuses", err);
    }
  };

  fetchCampuses();

  if (location.state?.lat && location.state?.lng) {
    setLat(location.state.lat);
    setLng(location.state.lng);
  }
}, [location.state]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="tab2"></IonBackButton>
          </IonButtons>
          <IonTitle>Create Building: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        
        <IonSelect
          label='Enter Campus: '
          fill="solid"
          color="tertiary"
          value={campusID}
          onIonChange={e => setCampusID(e.detail.value)}
        >
          {campuses.map((campus) => (
            <IonSelectOption key={campus.campus_ID} value={campus.campus_ID}>
              {campus.campus_name}
            </IonSelectOption>
          ))}
        </IonSelect>

        <IonInput color="tertiary" type="text" label="Edit Building Name: " value={name} fill="solid" onIonChange={e => setName(e.detail.value!)}></IonInput>
        <IonInput color="tertiary" type="text" label="Edit Address: " value={address} fill="solid" onIonChange={e => setAddress(e.detail.value!)}></IonInput>
        <IonInput color="tertiary" type="text" label="Edit Phone Number:" value={phone} fill="solid" onIonChange={e => setPhone(e.detail.value!)}></IonInput>
      

      <IonInput
        color="tertiary"
        type="text"
        fill="solid"
        label="Enter Latitude:"
        value={lat ?? ''}
        onIonChange={(e) => {
          const val = e.detail.value;
          if (!val) {
            setLat(null);
            return;
          }
          const num = parseFloat(val);
          setLat(isNaN(num) ? null : num);
        }}
      />

      <IonInput
        color="tertiary"
        type="text"
        fill="solid"
        label="Enter Longitude:"
        value={lng ?? ''}
        onIonChange={(e) => {
          const val = e.detail.value;
          if (!val) {
            setLng(null);
            return;
          }
          const num = parseFloat(val);
          setLng(isNaN(num) ? null : num);
        }}
      />
        
        <IonSelect fill="solid" color="tertiary" label="Days of Operation: " multiple={true} value={days} onIonChange={e => setDays(e.detail.value)}>
          <IonSelectOption value="Monday">Monday</IonSelectOption>
          <IonSelectOption value="Tuesday">Tuesday</IonSelectOption>
          <IonSelectOption value="Wednesday">Wednesday</IonSelectOption>
          <IonSelectOption value="Thursday">Thursday</IonSelectOption>
          <IonSelectOption value="Friday">Friday</IonSelectOption>
          <IonSelectOption value="Saturday">Saturday</IonSelectOption>
          <IonSelectOption value="Sunday">Sunday</IonSelectOption>
        </IonSelect>

      {days.includes("Monday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Monday Opening:" type="time" value={mondayOpen} onIonChange={e => setMondayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Monday Closing:" type="time" value={mondayClose} onIonChange={e => setMondayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

      {days.includes("Tuesday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Tuesday Opening:" type="time" value={tuesdayOpen} onIonChange={e => setTuesdayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Tuesday Closing:" type="time" value={tuesdayClose} onIonChange={e => setTuesdayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}
     
      {days.includes("Wednesday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Wednesday Opening:" type="time" value={wednesdayOpen} onIonChange={e => setWednesdayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Wednesday Closing:" type="time" value={wednesdayClose} onIonChange={e => setWednesdayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

      {days.includes("Thursday") && (  
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Thursday Opening:" type="time" value={thursdayOpen} onIonChange={e => setThursdayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Thursday Closing:" type="time" value={thursdayClose} onIonChange={e => setThursdayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

      {days.includes("Friday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Friday Opening:" type="time" value={fridayOpen} onIonChange={e => setFridayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Friday Closing:" type="time" value={fridayClose} onIonChange={e => setFridayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

      {days.includes("Saturday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Saturday Opening:" type="time" value={saturdayOpen} onIonChange={e => setSaturdayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Saturday Closing:" type="time" value={saturdayClose} onIonChange={e => setSaturdayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

      {days.includes("Sunday") && (
        <IonList inset={true}>
          <IonInput color="tertiary" fill="solid" label="Sunday Opening:" type="time" value={sundayOpen} onIonChange={e => setSundayOpen(e.detail.value!)}></IonInput>
          <IonInput color="tertiary" fill="solid" label="Sunday Closing:" type="time" value={sundayClose} onIonChange={e => setSundayClose(e.detail.value!)}></IonInput>
        </IonList>
      )}

        

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

export default AddBuilding;
        