import AttributeTableTemplate from "@arcgis/core/tables/AttributeTableTemplate";

export const getAttributeTableTemplate = (table: __esri.FeatureLayer) => {
  switch (table.title) {
    case "Parcels":
      return new AttributeTableTemplate({
        elements: [
          { type: "field", fieldName: "RealEstateId" },
          { type: "field", fieldName: "PinNumber" },
          { type: "field", fieldName: "SiteAddress" },
          { type: "field", fieldName: "FullStreetName" },
          { type: "field", fieldName: "City" },
          { type: "field", fieldName: "Owner" },
          { type: "field", fieldName: "DeedAcres" },
          { type: "field", fieldName: "LandClass" },
          { type: "field", fieldName: "TypeUse" },
          { type: "relationship", relationshipId: 0 },
        ],
        orderByFields: [
          { field: "FullStreetName", order: "asc" },
          { field: "SiteAddress", order: "asc" },
        ],
      });
    case "Accounts":
      return new AttributeTableTemplate({
        elements: [
          { type: "field", fieldName: "AccountId" },
          { type: "field", fieldName: "PremiseId" },
          { type: "field", fieldName: "CsaId" },
          { type: "field", fieldName: "RealEstateId" },
          { type: "field", fieldName: "Status" },
          { type: "field", fieldName: "TotalImpervious" },
          { type: "field", fieldName: "CreditedImpervious" },
          { type: "field", fieldName: "BillableImpervious" },
          { type: "field", fieldName: "PremiseImpervious" },
          { type: "field", fieldName: "UseClass" },
          { type: "field", fieldName: "BillingTier" },
          { type: "field", fieldName: "Sfeu" },
          { type: "field", fieldName: "PremiseSfeu" },
          { type: "field", fieldName: "ApportionmentCode" },
          { type: "field", fieldName: "ApportionmentUnits" },
          { type: "field", fieldName: "CcbUpdateFlag" },
          { type: "field", fieldName: "PremiseSfeu" },
          { type: "field", fieldName: "created_user" },
          { type: "field", fieldName: "created_date" },
          { type: "field", fieldName: "last_edited_user" },
          { type: "field", fieldName: "last_edited_date" },
          { type: "relationship", relationshipId: 0 },
          { type: "relationship", relationshipId: 6 },
          { type: "relationship", relationshipId: 4 },
          { type: "relationship", relationshipId: 2 },
          { type: "relationship", relationshipId: 5 },
          { type: "relationship", relationshipId: 3 },
        ],
        orderByFields: [{ field: "AccountId", order: "desc" }],
      });
    case "Impervious Surface":
      return new AttributeTableTemplate({
        elements: [
          { type: "field", fieldName: "AccountId" },
          { type: "field", fieldName: "Status" },
          { type: "field", fieldName: "MethodUsed" },
          { type: "field", fieldName: "MethodDate" },
          { type: "field", fieldName: "EffectiveDate" },
          { type: "field", fieldName: "TotalImpervious" },
          { type: "field", fieldName: "BuildingImpervious" },
          { type: "field", fieldName: "ParkingImpervious" },
          { type: "field", fieldName: "RecreationImpervious" },
          { type: "field", fieldName: "RoadTrailImpervious" },
          { type: "field", fieldName: "MiscImpervious" },
          { type: "field", fieldName: "OtherImpervious" },
          { type: "field", fieldName: "PermittedImpervious" },
          { type: "field", fieldName: "PermitNumber" },
          { type: "field", fieldName: "created_user" },
          { type: "field", fieldName: "created_date" },
          { type: "field", fieldName: "last_edited_user" },
          { type: "field", fieldName: "last_edited_date" },
          { type: "relationship", relationshipId: 0 },
        ],
        orderByFields: [{ field: "EffectiveDate", order: "desc" }],
      });
  }
};

export const actionColumnConfig = (view: __esri.MapView) => {
  return {
    label: "Go to feature",
    icon: "zoom-to-object",
    callback: (params: actionCallbackParams) => {
      view.goTo(params.feature);
    },
  };
};

type actionCallbackParams = {
  feature: __esri.Graphic;
  index: number;
  native: Event;
};
