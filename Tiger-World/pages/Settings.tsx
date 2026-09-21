import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonicSlides, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import './Settings.css';
import { arrowBack, eye, pencil, pencilOutline, pencilSharp } from 'ionicons/icons';
import './PasswordField'; './CopyPasswordField';
import { useEffect, useState } from 'react';

const Settings: React.FC = () => {
  const [user, setUser] = useState({email: "",});

useEffect(() => {
  const fetchUser = async () => {
    const userId = localStorage.getItem("user_ID");

    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/auth/me/${userId}`);

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchUser();
}, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons color="tertiary" slot="start">
            <IonBackButton defaultHref="tab2"></IonBackButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
          
            <IonList>
                <IonItem>
                    <IonLabel>Account Permissions: </IonLabel>
                    <IonLabel><p>Can edit, view</p></IonLabel>
                </IonItem>
                <IonItem>
                    <IonLabel>Dark Mode: </IonLabel>
                    <IonLabel><p>Coming soon!</p></IonLabel>
                    <IonToggle color="tertiary" checked={true}></IonToggle>
                </IonItem>
            </IonList>
          
      </IonContent>
    </IonPage>
  );
};


export default Settings;