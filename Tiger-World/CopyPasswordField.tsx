import { IonButton, IonIcon, IonInput } from '@ionic/react';
import './CopyPasswordField.css';
import { eye, eyeOff, lockClosed } from 'ionicons/icons';
import { useState } from 'react';


  interface Props {
    onCopyFieldChange: (value: string) => void;
  }

const CopyPasswordField: React.FC<Props> = ({onCopyFieldChange}) => {

  const [showPassword, setShowPassword] = useState(false);

  const handleCopyFieldChange = (e: CustomEvent) => {
    const val = e.detail.value;
    onCopyFieldChange(val);
  };

  return (
    <div>
        <IonInput 
          type={showPassword ? 'text' : 'password'}
          color="tertiary" label="Password: " 
          placeholder="Re-enter password" 
          fill="solid"
          onIonInput={handleCopyFieldChange}
        >
          <IonIcon slot="start" icon={lockClosed} aria-hidden="true"></IonIcon>
          <IonButton fill="clear" slot="end" aria-label="Show/hide" onClick={() => setShowPassword(prev => !prev)}>
            <IonIcon color="tertiary" slot="icon-only" icon={showPassword ? eyeOff : eye} aria-hidden="true"></IonIcon>
          </IonButton>
        </IonInput> 

    </div>
  );
};

export default CopyPasswordField;