import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import './Calendar.css';
import { add, calendar, calendarClear, trash } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useIonViewWillEnter } from '@ionic/react';

const Calendar: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('classes') || '[]');
    setClasses(stored);
  }, []);
  
  useIonViewWillEnter(() => {
    const stored = JSON.parse(localStorage.getItem('classes') || '[]');
    setClasses(stored);
    });

  const deleteClass = (indexToDelete: number) => {
    const updated = classes.filter((_, index) => index !== indexToDelete);
    setClasses(updated);
    localStorage.setItem('classes', JSON.stringify(updated));
    };

  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="tab2"></IonBackButton>
          </IonButtons>
          <IonTitle>Your Schedule: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

    {classes.length === 0 ? (
      <IonItem>
        <IonLabel>Add a class to see it here.</IonLabel>
      </IonItem>
    ) : (
      <IonList>
        {classes.map((cls, index) => (
          <IonItem key={index}>
            <IonIcon icon={calendar} slot="start" />

            <IonLabel>
              <h2>{cls.title}</h2>
              <p>{cls.days} {cls.startTime} - {cls.endTime}</p>
              <p>{cls.building} {cls.room}</p>
            </IonLabel>
                        
            <IonButton color="danger" slot="end" onClick={() => deleteClass(index)}>
              <IonIcon icon={trash}></IonIcon>
            </IonButton>
          </IonItem>
        ))}
      </IonList>
    )}

          <div className="ion-margin">
            <IonButton href="edit" color="tertiary" >
              <IonIcon icon={add}></IonIcon>
              <IonLabel>Add Class</IonLabel>
            </IonButton>

          <IonButton href="events" color="tertiary" >
            <IonIcon icon={calendarClear}></IonIcon>
            <IonLabel>View Events</IonLabel>
          </IonButton>
        </div>
        
      </IonContent>
    </IonPage>
  );
};

export default Calendar;