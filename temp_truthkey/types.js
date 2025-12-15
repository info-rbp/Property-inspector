"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionRating = exports.KeyAccessType = exports.ManagedByType = exports.DataSource = exports.PropertyType = void 0;
var PropertyType;
(function (PropertyType) {
    PropertyType["HOUSE"] = "House";
    PropertyType["APARTMENT"] = "Apartment";
    PropertyType["TOWNHOUSE"] = "Townhouse";
    PropertyType["COMMERCIAL"] = "Commercial";
    PropertyType["DUPLEX"] = "Duplex";
    PropertyType["VILLA"] = "Villa";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var DataSource;
(function (DataSource) {
    DataSource["GNAF"] = "GNAF (Official)";
    DataSource["LAND_REGISTRY"] = "Land Registry";
    DataSource["GOVT_PLANNING"] = "Govt Planning";
    DataSource["LICENSED_PROVIDER"] = "Licensed Data";
    DataSource["USER"] = "User Override";
    DataSource["INSPECTOR"] = "Inspector Verified";
    DataSource["AI_PARSED"] = "AI Normalised";
})(DataSource || (exports.DataSource = DataSource = {}));
var ManagedByType;
(function (ManagedByType) {
    ManagedByType["REAL_ESTATE_AGENCY"] = "Real Estate Agency";
    ManagedByType["PRIVATE_LANDLORD"] = "Private Landlord";
    ManagedByType["OTHER"] = "Other";
})(ManagedByType || (exports.ManagedByType = ManagedByType = {}));
var KeyAccessType;
(function (KeyAccessType) {
    KeyAccessType["HELD_WITH_AGENT"] = "Held with Agent";
    KeyAccessType["HELD_WITH_LANDLORD"] = "Held with Landlord";
    KeyAccessType["SAFEBOX_LOCKBOX"] = "Safebox / Lockbox";
    KeyAccessType["TENANT_PROVIDE_ACCESS"] = "Tenant to provide access";
    KeyAccessType["OTHER"] = "Other";
})(KeyAccessType || (exports.KeyAccessType = KeyAccessType = {}));
var ConditionRating;
(function (ConditionRating) {
    ConditionRating["GOOD"] = "Good";
    ConditionRating["FAIR"] = "Fair";
    ConditionRating["POOR"] = "Poor";
    ConditionRating["CRITICAL"] = "Critical";
    ConditionRating["NOT_INSPECTED"] = "Not Inspected";
})(ConditionRating || (exports.ConditionRating = ConditionRating = {}));
