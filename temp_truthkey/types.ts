
export enum PropertyType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  TOWNHOUSE = 'Townhouse',
  COMMERCIAL = 'Commercial',
  DUPLEX = 'Duplex',
  VILLA = 'Villa'
}

export enum DataSource {
  GNAF = 'GNAF (Official)',
  LAND_REGISTRY = 'Land Registry',
  GOVT_PLANNING = 'Govt Planning',
  LICENSED_PROVIDER = 'Licensed Data',
  USER = 'User Override',
  INSPECTOR = 'Inspector Verified',
  AI_PARSED = 'AI Normalised'
}

export interface DataField<T> {
  value: T;
  source: DataSource;
  lastUpdated: string; // ISO Date
  confidence?: number; // 0-1
}

// 1. Core Property Identity (GNAF / Geoscape)
export interface PropertyIdentity {
  gnafPid: string; // The primary key
  placeId?: string; // Google Places ID
  address: string; // Normalized standard address
  streetNumber: string;
  streetName: string;
  suburb: string;
  state: string;
  postcode: string;
  councilArea: string; // LGA
  latitude: number;
  longitude: number;
}

// 2. Land & Legal (Valuer General / Planning)
export interface PropertyLegal {
  lotNumber: string;
  planNumber: string;
  parcelId: string; // State specific ID
  landSizeSqm: number;
  zoningCode: string; // e.g., R2
  zoningDescription: string;
  overlays: {
    heritage: boolean;
    bushfire: boolean;
    flood: boolean;
  };
}

// 3. Structural Attributes (Physical Reality)
export interface PropertyAttributes {
  type: DataField<PropertyType>;
  bedrooms: DataField<number>;
  bathrooms: DataField<number>;
  carSpaces: DataField<number>;
  floorAreaSqm?: DataField<number>;
  yearBuilt?: DataField<number>;
  constructionMaterial?: DataField<string>;
}

// 4. Sales History (Immutable Facts)
export interface SaleRecord {
  date: string;
  price: number;
  type: string; // Auction, Private Treaty
  settlementDate?: string;
}

// 5. Rental Market Data (Aggregated Context)
export interface RentalMarketContext {
  // Area-based Weekly Averages (The Context)
  medianRentSuburb: number; // All properties
  medianRentType: number;   // Matching PropertyType
  medianRentBedrooms: number; // Matching Bedroom count
  
  // Market Health
  vacancyRate: number;
  trend12Month: 'up' | 'down' | 'flat';
  
  // Specific History (Optional)
  lastAdvertisedWeekly?: number;
  lastAdvertisedDate?: string;
}

// 6. Location Context (Spatial Overlays)
export interface PropertyLocation {
  schools: { name: string; distanceKm: number }[];
  transport: { name: string; type: string; distanceKm: number }[];
  emergencyServices: { type: string; riskLevel: 'Low' | 'Medium' | 'High' }[];
}

export enum ManagedByType {
  REAL_ESTATE_AGENCY = "Real Estate Agency",
  PRIVATE_LANDLORD = "Private Landlord",
  OTHER = "Other",
}

export enum KeyAccessType {
  HELD_WITH_AGENT = "Held with Agent",
  HELD_WITH_LANDLORD = "Held with Landlord",
  SAFEBOX_LOCKBOX = "Safebox / Lockbox",
  TENANT_PROVIDE_ACCESS = "Tenant to provide access",
  OTHER = "Other",
}

export interface ManagementInfo {
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;

  managedBy: ManagedByType;
  managingAgencyName?: string;

  keyAccess: KeyAccessType;
  accessNotes?: string;
}

export interface PropertyMetadata {
  createdDate: string;
  lastVerified: string;
  status: 'Draft' | 'Active' | 'Archived';
  updatedAt?: string;
}

export interface Property {
  id: string; // Internal UUID
  identity: PropertyIdentity;
  legal: PropertyLegal;
  attributes: PropertyAttributes;
  salesHistory: SaleRecord[];
  rentalContext: RentalMarketContext;
  location: PropertyLocation;
  metadata: PropertyMetadata;
  thumbnailUrl: string;
  management?: ManagementInfo;
}

export enum ConditionRating {
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  CRITICAL = 'Critical',
  NOT_INSPECTED = 'Not Inspected'
}

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  rating: ConditionRating;
  notes: string;
  photos: string[]; // Base64 data strings or URLs
}

export type InspectionStatus = 'draft' | 'completed' | 'final';

export interface Inspection {
  id: string;
  propertyId: string;
  date: string;
  inspectorName: string;
  status: InspectionStatus;
  items: InspectionItem[];
  summary: string;
}
