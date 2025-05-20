import Collection from "@arcgis/core/core/Collection";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Field from "@arcgis/core/layers/support/Field";
import { getLayerByTitle } from "../../sources";
type SuggestParams = {
  maxSuggestions: number;
  sourceIndex: number;
  spatialReference: __esri.SpatialReference;
  suggestTerm: string;
  view: __esri.MapView;
};
type ResultParams = {
  exactMatch: boolean;
  location: __esri.Point;
  maxResults: number;
  sourceIndex: number;
  spatialReference: __esri.SpatialReference;
  suggestResult: __esri.SuggestResult;
  view: __esri.MapView;
};

export const hiddenFields = new Collection([
  "OBJECTID",
  "GlobalID",
  "TotalImpervious",
  "CreditedImpervious",
  "BillableImpervious",
  "ApportionmentCode",
  "ApportionmentUnits",
  "CcbUpdateFlag",
  "created_user",
  "created_date",
  "last_edited_date",
  "last_edited_user",
  "Sfeu",
  "PremiseSfeu",
  "CsaId",
  "PremiseImpervious",
  "Status",
]);
let featureLayer: FeatureLayer | null = null;

export const getApportionmentTableLayer = (
  accountsTable: FeatureLayer | null
): FeatureLayer | null => {
  if (!featureLayer) {
    const fields = getFields(accountsTable) as __esri.Field[];
    featureLayer = new FeatureLayer({
      source: [],
      fields: fields,
      geometryType: "polygon",
      spatialReference: accountsTable?.spatialReference,
      objectIdField: accountsTable?.objectIdField,
    });
    return featureLayer;
  } else {
    return featureLayer;
  }
};

export const updateTableLayer = async (
  features: __esri.Graphic[],
  featureTable: HTMLArcgisFeatureTableElement | null
) => {
  const selected = await featureLayer?.queryFeatures({
    where: `OBJECTID in (${featureTable?.highlightIds})`,
    outFields: ["OBJECTID", "AccountId"],
    returnGeometry: false,
  });
  const accountIds = selected?.features.map((feature) =>
    feature.getAttribute("AccountId")
  );
  const deletes = await featureLayer?.queryFeatures({
    where: `OBJECTID not in (${featureTable?.highlightIds})`,
    outFields: ["OBJECTID"],
    returnGeometry: false,
  });

  await featureLayer?.applyEdits({ deleteFeatures: deletes?.features });
  const addFeatures = features.length
    ? features.filter(
        (feature) => !accountIds?.includes(feature.getAttribute("AccountId"))
      )
    : features;
  await featureLayer?.applyEdits({ addFeatures: addFeatures });
};

const getFields = (accountsTable: FeatureLayer | null) => {
  const fields = accountsTable?.fields.map((field: Field) => field);
  fields?.unshift(
    new Field({
      type: "string",
      name: "SiteAddress",
      alias: "Site Address",
      length: 100,
    })
  );
  return fields;
};

export const getApportionmentSources = (arcgisMap: HTMLArcgisMapElement) => {
  const sources: Collection<__esri.LayerSearchSource> = new Collection([]);
  const parcels = getLayerByTitle(arcgisMap, "Parcels");
  if (parcels) {
    sources.addMany(
      new Collection([
        {
          placeholder: "Street name",

          name: "Street name",
          getSuggestions: async (params: SuggestParams) => {
            const results = await parcels.queryFeatures({
              where: `FullStreetName like '${params.suggestTerm}%'`,
              outFields: ["FullStreetName"],
              orderByFields: ["FullStreetName"],
              returnDistinctValues: true,
              returnGeometry: false,
            });
            const values = results.features.map((feature) => {
              return {
                key: feature.getAttribute("FullStreetName"),
                text: feature.getAttribute("FullStreetName"),
                sourceIndex: params.sourceIndex,
              };
            });
            return values;
          },
          getResults: async (params: ResultParams) => {
            const value = params.suggestResult.text;
            const result = await parcels.queryFeatures({
              where: `FullStreetName = '${value}'`,
              returnGeometry: true,
              orderByFields: ["SiteAddress"],
              outFields: ["SiteAddress", "OBJECTID"],
            });
            const oids = result.features.map((feature) =>
              feature.getAttribute("OBJECTID")
            );
            const relationship = parcels.relationships?.find(
              (relationship) => relationship.name === "Account"
            );
            const relateResults = await parcels.queryRelatedFeatures({
              objectIds: oids,
              outFields: ["*"],
              where: "Status = 'A'",
              relationshipId: relationship?.id,
            });
            const data = oids.flatMap((oid) => {
              return relateResults[oid]?.features.map(
                (feature: __esri.Graphic) => {
                  const match = result.features.find(
                    (f) => f.getAttribute("OBJECTID") === oid
                  );
                  if (match) {
                    feature.setAttribute(
                      "SiteAddress",
                      match.getAttribute("SiteAddress")
                    );
                    feature.geometry = match.geometry;
                  }

                  return feature;
                }
              );
            });
            return data;
          },
        },
      ])
    );
  }
  return sources;
};

export const getAccountRelatedFeatures = async (
  account: __esri.Graphic | undefined,
  relationshipName: string,
  orderByFields: string[] = []
): Promise<__esri.Graphic[] | undefined> => {
  if (account?.layer?.type === "feature") {
    const accounts = account.layer as __esri.FeatureLayer;
    const relationship = accounts.relationships?.find(
      (relationship) => relationship.name === relationshipName
    );
    const oid = account.getAttribute("OBJECTID");
    if (relationship && oid) {
      const relatedResult = await accounts.queryRelatedFeatures({
        relationshipId: relationship.id,
        objectIds: [oid],
        returnGeometry: true,
        outFields: ["*"],
        orderByFields: orderByFields,
      });
      if (relatedResult[oid]) {
        return relatedResult[oid].features;
      }
    }
  }
};
