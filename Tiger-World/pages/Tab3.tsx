import { IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonPage, IonRow, IonTitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import './Tab3.css';
import { arrowForward, link } from 'ionicons/icons';
import { usePhotoGallery } from '../hooks/useCamera';
import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { Building } from './types';

const Tab3: React.FC = () => {
  const { photos, addNewToGallery } = usePhotoGallery();
  const [rooms, setRooms] = useState<any[]>([]);
  const history = useHistory();
 
  const location = useLocation<any>();
  const building = location.state?.building;
  const buildingFromState = location.state?.building;


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="tab2"></IonBackButton>
          </IonButtons>
          <IonTitle>More...</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>

      {building && (
        <div className="ion-margin">
          <IonLabel class="ion-text-wrap"> 
            <h1>{building?.name}</h1> 
            <p>{building?.address}</p> 
            <p>Baton Rouge, LA 70803</p> 
          </IonLabel>

          <IonItem>
            <IonLabel> <h1>Phone: </h1> <p>{building?.phone}</p></IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel> <h1>Website: </h1> </IonLabel>
            <IonButton href="https://www.lsu.edu/eng/about/pft-hall-overview.php" color="tertiary">
              <IonIcon icon={link}></IonIcon>
            </IonButton>
          </IonItem>

          <IonList inset={false}>
            <div className="ion-margin"><IonLabel> <h1> Find a Room: </h1> </IonLabel></div>

            {rooms.map((cls, index) => (
              <IonItem key={index}>
            
                <IonLabel>
                  <p>PFT {cls.number}</p>
                </IonLabel>
                                    
             </IonItem>
             ))}

            <IonItem>
              <IonLabel><p>Look Inside...</p></IonLabel>
              <IonButton href="tab4" color="tertiary">
                <IonIcon icon={arrowForward}></IonIcon>
              </IonButton>
            </IonItem>
          </IonList>

          <IonList inset={false}>
            <div className="ion-margin"><IonLabel> <h1> Hours: </h1> </IonLabel></div>
            <IonItem>
              <IonLabel><p>Mon: {building?.mondayOpen} - {building?.mondayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Tues: {building?.tuesdayOpen} - {building?.tuesdayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Wed: {building?.wednesdayOpen}- {building?.wednesdayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Thurs: {building?.thursdayOpen}- {building?.thursdayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Fri: {building?.fridayOpen}- {building?.fridayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Sat: {building?.saturdayOpen}- {building?.saturdayClose}</p></IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><p>Sun: {building?.sundayOpen}- {building?.sundayClose}</p></IonLabel>
            </IonItem>
          </IonList> 

          <IonList>
            <div className="ion-margin"><IonLabel><h1> Gallery: </h1></IonLabel></div>
            <IonGrid>
              <IonRow>
                {photos.map((photo) => (
                    <IonCol size="5" key={photo.filepath}>
                      <IonImg src={photo.webviewPath} />
                    </IonCol>
                ))}
              </IonRow>
            </IonGrid>
            
          </IonList>

          <IonButton onClick={() => history.push('/tab2', {lat: 30.407478, lng: -91.179712, name: building.name})} color="tertiary">
            <IonLabel>Get directions</IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>  
          </IonButton>

          <IonButton
            onClick={() =>
              history.push(`/edit-building/${building.id || building.building_ID}`, {
                building
            })}
          >
            <IonLabel>Is this correct? Make an edit</IonLabel>
            <IonIcon icon={arrowForward}></IonIcon>
          </IonButton>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default Tab3;
