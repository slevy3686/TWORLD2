export interface Building {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;

  days: string[];

  mondayOpen?: string;
  mondayClose?: string;

  tuesdayOpen?: string;
  tuesdayClose?: string;

  wednesdayOpen?: string;
  wednesdayClose?: string;

  thursdayOpen?: string;
  thursdayClose?: string;

  fridayOpen?: string;
  fridayClose?: string;

  saturdayOpen?: string;
  saturdayClose?: string;

  sundayOpen?: string;
  sundayClose?: string;
}