import { IonButton, IonContent, IonFab, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, IonPage, IonThumbnail } from '@ionic/react';
import './Tab1.css';
import { arrowForward, eye, lockClosed } from 'ionicons/icons';
import { useState } from 'react';
import { useIonRouter } from '@ionic/react';

const Tab1: React.FC = () => {
  const [emailValue, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useIonRouter();
  const [loginError, setLoginError] = useState("");

const loginUser = async () => {
  try {
    const response = await fetch("https://balanced-upliftment-production-fd8f.up.railway.app/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: emailValue,
        password: password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data.error); 
      return;
    }

    setLoginError("");
    console.log("Login success:", data);
    localStorage.setItem("user_ID", data.user_ID);
    router.push('/tab2');

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    setLoginError("Network error. Try again.");
  }
};

  return (
    <IonPage>
      <IonContent fullscreen>
        
        <IonFab horizontal="center" vertical="top" slot="fixed">
          <IonThumbnail>
            <img alt="TigerWorld Logo" src="/src/photos/logonobg.png"></img>
          </IonThumbnail>
        </IonFab>
  

        <IonFab horizontal="center" vertical="center" slot="fixed">
          <div className="ion-margin">
          <IonLabel >
            <h1>Log In</h1>
          </IonLabel>

        {loginError && (
          <IonLabel color="danger">{loginError}</IonLabel>
        )}

          <IonInput 
            type="email" 
            color="tertiary" 
            label="University Email: " 
            placeholder="Type here" 
            fill="solid"
            value={emailValue}
            onIonChange={e => setEmail(e.detail.value!)}>
          </IonInput>
          

          <IonInput type="password" color="tertiary" label="Password: " placeholder="Type here" fill="solid" value={password} onIonChange={e => setPassword(e.detail.value!)}>
            <IonIcon slot="start" icon={lockClosed} aria-hidden="true"></IonIcon>
            <IonInputPasswordToggle color="tertiary" slot="end"></IonInputPasswordToggle>
          </IonInput>
      
          <IonButton onClick={loginUser} color="tertiary">
            <IonLabel>Continue: </IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>
        
          <IonButton routerLink="/sign-up" color="tertiary">
            <IonLabel>Sign Up: </IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>

          <IonButton routerLink="/tab2" color="tertiary">
            <IonLabel>Guest: </IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>

          </div>
        </IonFab>
        
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
