import Collection from "@arcgis/core/core/Collection";

export const getLayerByTitle = (
  arcgisMap: HTMLArcgisMapElement,
  title: string
) => {
  const layer = arcgisMap.view.map.layers.find(
    (layer) => layer.title === title
  );
  if (layer) {
    if (layer.type === "feature") {
      return layer as __esri.FeatureLayer;
    }
  }
};

export const getTableByTitle = (
  arcgisMap: HTMLArcgisMapElement,
  title: string
) => {
  const layer = arcgisMap.view.map.tables.find(
    (layer) => layer.title === title
  );
  if (layer) {
    if (layer.type === "feature") {
      return layer as __esri.FeatureLayer;
    }
  }
};
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
export const getSearchSources = (arcgisMap: HTMLArcgisMapElement) => {
  const sources: Collection<__esri.LayerSearchSource> = new Collection([]);
  const parcels = getLayerByTitle(arcgisMap, "Parcels");
  if (parcels) {
    sources.addMany(
      new Collection([
        {
          layer: parcels,
          placeholder: "Site Address",
          searchFields: ["SiteAddress"],
          orderByFields: ["SiteAddress"],
          displayField: "SiteAddress",
          name: "Site Address",
        },
        {
          layer: parcels,
          placeholder: "REID",
          searchFields: ["RealEstateId"],
          orderByFields: ["RealEstateId"],
          displayField: "RealEstateId",
          name: "REID",
        },
        {
          layer: parcels,
          placeholder: "PIN",
          searchFields: ["PinNumber"],
          orderByFields: ["PinNumber"],
          displayField: "PinNumber",
          name: "PIN",
        },
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
            const results = await parcels.queryFeatures({
              where: `FullStreetName = '${value}'`,
              returnGeometry: true,
              orderByFields: ["SiteAddress"],
              outFields: ["*"],
            });
            return results.features.map((feature: __esri.Graphic) => {
              return {
                feature: feature,
                name: name,
              };
            });
            // const oids = result.features.map((feature) =>
            //   feature.getAttribute("OBJECTID")
            // );
            // const relationship = parcels.relationships?.find(
            //   (relationship) => relationship.name === "Account"
            // );
            // const relateResults = await parcels.queryRelatedFeatures({
            //   objectIds: oids,
            //   outFields: ["*"],
            //   where: "Status = 'A'",
            //   relationshipId: relationship?.id,
            // });
            // const data = oids.flatMap((oid) => {
            //   return relateResults[oid]?.features.map(
            //     (feature: __esri.Graphic) => {
            //       const match = result.features.find(
            //         (f) => f.getAttribute("OBJECTID") === oid
            //       );
            //       if (match) {
            //         feature.setAttribute(
            //           "SiteAddress",
            //           match.getAttribute("SiteAddress")
            //         );
            //         feature.geometry = match.geometry;
            //       }

            //       return feature;
            //     }
            //   );
            // });
            // return data;
          },
        },
      ])
    );
  }
  const accounts = getTableByTitle(arcgisMap, "Accounts");
  if (accounts) {
    sources.addMany(
      new Collection([
        {
          layer: accounts,
          placeholder: "Account ID",
          searchFields: ["AccountId"],
          displayField: "AccountId",
          name: "Account ID",
        },
        {
          layer: accounts,
          placeholder: "Premise ID",
          searchFields: ["PremiseId"],
          displayField: "PremiseId",
          name: "Premise ID",
        },
        {
          layer: accounts,
          placeholder: "CSA ID",
          searchFields: ["CsaId"],
          displayField: "CsaId",
          name: "CSA ID",
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
        outSpatialReference: {wkid: 102100}
      });
      if (relatedResult[oid]) {
        return relatedResult[oid].features;
      }
    }
  }
};
