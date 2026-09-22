import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import './Events.css';
import { add, arrowForward, calendar, trash } from 'ionicons/icons';
import { useEffect, useState } from 'react';

const Events: React.FC = () => {

  const [events, setEvents] = useState<any[]>([]);
  
    useEffect(() => {
      const stored = JSON.parse(localStorage.getItem('events') || '[]');
      setEvents(stored);
    }, []);
    
    useIonViewWillEnter(() => {
      const stored = JSON.parse(localStorage.getItem('events') || '[]');
      setEvents(stored);
      });
  
    const deleteClass = (indexToDelete: number) => {
      const updated = events.filter((_, index) => index !== indexToDelete);
      setEvents(updated);
      localStorage.setItem('events', JSON.stringify(updated));
      };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="calendar"></IonBackButton>
          </IonButtons>
          <IonTitle>Upcoming Events: </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

    {events.length === 0 ? (
      <IonItem>
        <IonLabel>Add an event to see it here.</IonLabel>
      </IonItem>
    ) : (
      <IonList>
        {events.map((cls, index) => (
          <IonItem key={index}>
            <IonIcon icon={calendar} slot="start" />

            <IonLabel>
              <h2>{cls.title}</h2>
              <p>{cls.date} {cls.start} - {cls.end}</p>
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
        <IonButton href="/edit-events" color="tertiary">
          <IonIcon icon={add}></IonIcon>
          <IonLabel>Add Event</IonLabel>
        </IonButton>
      </div>

      </IonContent>
    </IonPage>
  );
};

export default Events;
