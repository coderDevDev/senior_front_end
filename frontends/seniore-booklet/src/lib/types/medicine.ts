export interface Medicine {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  dosage: string;
  image: string;
  pharmacy: string;
}

export interface ApiError {
  message: string;
  status: number;
}
