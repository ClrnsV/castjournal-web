export interface Species {
  id: string;
  commonName: string;
  scientificName: string | null;
  category: string | null;
  description: string | null;
  averageSize: string | null;
  imageUrl: string | null;
  isApproved: boolean;
}