import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonLabel, IonPage, IonTextarea, IonTitle, IonToolbar, useIonRouter } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './SignUp.css';
import { arrowForward, copy } from 'ionicons/icons';
import { useState } from 'react';
import PasswordField from './PasswordField';
import CopyPasswordField from './CopyPasswordField';


const SignUp: React.FC = () => {
  //remember to clear passwords when switching pages

  const [emailInvalidText, setEmailInvalidText] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [emailValue, setEmail] = useState("");

  const [passwordInvalidText, setPasswordInvalidText] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [password, setPassword] = useState("");
  const [copyPassword, setCopyPassword] = useState("");

  const router = useIonRouter();
  
  const saveUser = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
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
    console.log("User created:", data);

    router.push('/tab1');

  } catch (error) {
    console.error("Signup error:", error);
  }
};

  const handlePassordFieldChange = (val : string) =>{
    //At Least 6 Characters with at least one alphabet, one digit, and one special character
    const passwordRegex =  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
    const isPasswordValid = passwordRegex.test(val);
    setPassword(val);
    if(isPasswordValid && val == copyPassword){
      setPasswordInvalidText("");
      setPasswordValid(true);
    }
    else if (isPasswordValid && val != copyPassword){
      setPasswordInvalidText("Passwords must match");
      setPasswordValid(true);
    }
    else{
      setPasswordInvalidText("Password needs to be 6 characters with 1 letter, 1 digit, and one special character.");
      setPasswordValid(false);
    }
  }

  const handleCopyFieldChange = (val : string) => {
    setCopyPassword(val);
    if((val == password) && passwordValid){
      setPasswordInvalidText("");
    } 
    else if (passwordValid && val != password){
      setPasswordInvalidText("Passwords must match");
    }
    else {
      setPasswordInvalidText("Password needs to be 6 characters with 1 letter, 1 digit, and one special character.");
    }
  }

const handleEmailFieldChange = (e: CustomEvent) => {
  const value = e.detail.value;

  setEmail(value); 

  const regex = /^[a-zA-Z][a-zA-Z0-9]*@lsu\.edu$/;

  if (regex.test(value)) {
    setEmailInvalidText("");
    setEmailValid(true);
  } else {
    setEmailInvalidText("You must enter a valid email.");
    setEmailValid(false);
  }
};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="tab1"></IonBackButton>
          </IonButtons>
          <IonTitle>Sign Up: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

        <div className="ion-margin"><p>Enter a valid lsu.edu email.</p></div>
        
        <p className="email-invalid">{emailInvalidText}</p>
        <div></div>
        <p className="password-invalid">{passwordInvalidText}</p>
        <IonInput 
          type="email" 
          color="tertiary" 
          label="University Email: " 
          placeholder="Enter your email" 
          fill="solid"
          onIonInput={handleEmailFieldChange}
        >
        </IonInput>
        
        <PasswordField onPasswordFieldChange={handlePassordFieldChange}/>

        <CopyPasswordField onCopyFieldChange={handleCopyFieldChange}/>
      
        <div className="ion-margin">
          <IonButton color="tertiary" disabled={!(password == copyPassword && passwordValid && emailValid)} onClick={saveUser}
          >
            <IonLabel>Sign Up:</IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
            </IonButton>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default SignUp;