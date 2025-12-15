export declare enum PropertyType {
    HOUSE = "House",
    APARTMENT = "Apartment",
    TOWNHOUSE = "Townhouse",
    COMMERCIAL = "Commercial",
    DUPLEX = "Duplex",
    VILLA = "Villa"
}
export declare enum DataSource {
    GNAF = "GNAF (Official)",
    LAND_REGISTRY = "Land Registry",
    GOVT_PLANNING = "Govt Planning",
    LICENSED_PROVIDER = "Licensed Data",
    USER = "User Override",
    INSPECTOR = "Inspector Verified",
    AI_PARSED = "AI Normalised"
}
export interface DataField<T> {
    value: T;
    source: DataSource;
    lastUpdated: string;
    confidence?: number;
}
export interface PropertyIdentity {
    gnafPid: string;
    placeId?: string;
    address: string;
    streetNumber: string;
    streetName: string;
    suburb: string;
    state: string;
    postcode: string;
    councilArea: string;
    latitude: number;
    longitude: number;
}
export interface PropertyLegal {
    lotNumber: string;
    planNumber: string;
    parcelId: string;
    landSizeSqm: number;
    zoningCode: string;
    zoningDescription: string;
    overlays: {
        heritage: boolean;
        bushfire: boolean;
        flood: boolean;
    };
}
export interface PropertyAttributes {
    type: DataField<PropertyType>;
    bedrooms: DataField<number>;
    bathrooms: DataField<number>;
    carSpaces: DataField<number>;
    floorAreaSqm?: DataField<number>;
    yearBuilt?: DataField<number>;
    constructionMaterial?: DataField<string>;
}
export interface SaleRecord {
    date: string;
    price: number;
    type: string;
    settlementDate?: string;
}
export interface RentalMarketContext {
    medianRentSuburb: number;
    medianRentType: number;
    medianRentBedrooms: number;
    vacancyRate: number;
    trend12Month: 'up' | 'down' | 'flat';
    lastAdvertisedWeekly?: number;
    lastAdvertisedDate?: string;
}
export interface PropertyLocation {
    schools: {
        name: string;
        distanceKm: number;
    }[];
    transport: {
        name: string;
        type: string;
        distanceKm: number;
    }[];
    emergencyServices: {
        type: string;
        riskLevel: 'Low' | 'Medium' | 'High';
    }[];
}
export declare enum ManagedByType {
    REAL_ESTATE_AGENCY = "Real Estate Agency",
    PRIVATE_LANDLORD = "Private Landlord",
    OTHER = "Other"
}
export declare enum KeyAccessType {
    HELD_WITH_AGENT = "Held with Agent",
    HELD_WITH_LANDLORD = "Held with Landlord",
    SAFEBOX_LOCKBOX = "Safebox / Lockbox",
    TENANT_PROVIDE_ACCESS = "Tenant to provide access",
    OTHER = "Other"
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
    id: string;
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
export declare enum ConditionRating {
    GOOD = "Good",
    FAIR = "Fair",
    POOR = "Poor",
    CRITICAL = "Critical",
    NOT_INSPECTED = "Not Inspected"
}
export interface InspectionItem {
    id: string;
    category: string;
    name: string;
    rating: ConditionRating;
    notes: string;
    photos: string[];
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
