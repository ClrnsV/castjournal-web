export interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  waterType: string;
  isPublic: boolean;
}

export interface CreateLocationPayload {
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  waterType: string;
  isPublic: boolean;
}