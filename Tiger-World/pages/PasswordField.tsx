import { IonButton, IonIcon, IonInput } from '@ionic/react';
import './PasswordField.css';
import { eye, eyeOff, lockClosed } from 'ionicons/icons';
import { useState } from 'react';


  interface Props {
    onPasswordFieldChange: (value: string) => void;
  }

const PasswordField: React.FC<Props> = ({onPasswordFieldChange}) => {

  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordFieldChange = (e: CustomEvent) => {
    const val = e.detail.value;
    onPasswordFieldChange(val);
  };

  return (
    <div>
        <IonInput 
          type={showPassword ? 'text' : 'password'}
          color="tertiary" label="Password: " 
          placeholder="Re-enter password" 
          fill="solid"
          onIonInput={handlePasswordFieldChange}
        >
          <IonIcon slot="start" icon={lockClosed} aria-hidden="true"></IonIcon>
          <IonButton fill="clear" slot="end" aria-label="Show/hide" onClick={() => setShowPassword(prev => !prev)}>
            <IonIcon color="tertiary" slot="icon-only" icon={showPassword ? eyeOff : eye} aria-hidden="true"></IonIcon>
          </IonButton>
        </IonInput> 

    </div>
  );
};

export default PasswordField;