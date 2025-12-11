/**
 * Address Types - Baseado em Flutter address_model.dart
 */

export interface Address {
  id: number;
  addressType: AddressType;
  contactPersonNumber: string;
  address: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  contactPersonName: string;
  floor?: string;
  house?: string;
  road?: string;
  isDefault: boolean;
}

export type AddressType = 'home' | 'office' | 'others';

export interface AddAddressRequest {
  addressType: AddressType;
  contactPersonNumber: string;
  address: string;
  latitude: string;
  longitude: string;
  contactPersonName: string;
  floor?: string;
  house?: string;
  road?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends AddAddressRequest {
  id: number;
}

export interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  isLoading: boolean;
  error: string | null;
}

export interface LocationPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}

export interface LocationState {
  currentPosition: {
    latitude: number;
    longitude: number;
  } | null;
  predictions: LocationPrediction[];
  selectedPlace: PlaceDetails | null;
  isLoading: boolean;
  error: string | null;
}
