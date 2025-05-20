import Collection from "@arcgis/core/core/Collection";
import * as containsOperator from "@arcgis/core/geometry/operators/containsOperator";
import Basemap from "@arcgis/core/Basemap";
import { RefObject } from "react";

export const getParcelsAtHoldPoint = async (
  arcgisMap: HTMLArcgisMapElement,
  mapPoint: __esri.Point,
  parcelLayer: __esri.FeatureLayer
): Promise<__esri.Graphic[]> => {
  const hitResult = await arcgisMap.hitTest(
    arcgisMap.toScreen(mapPoint) as __esri.MapViewScreenPoint,
    {
      include: [parcelLayer],
    }
  );
  if (hitResult.results.length) {
    const hits = hitResult.results.map(
      (result) => (result as __esri.GraphicHit).graphic
    );
    return hits;
  } else {
    return [];
  }
};

export const nextBasemap: __esri.Basemap = new Basemap({
  portalItem: {
    portal: { url: "https://ral.maps.arcgis.com" },
    id: "c8dd048031e34c368d37fd47e7dc5330",
  },
});
export const addressOnParcel = (
  parcelGeometry: __esri.GeometryUnion,
  addressGeometry: __esri.GeometryUnion
): boolean => {
  return containsOperator.execute(parcelGeometry, addressGeometry);
};

export const setCsaIdActionVisibility = (
  actionVisible: boolean,
  addressPointsLayer: __esri.FeatureLayer
) => {
  const actions = addressPointsLayer.popupTemplate?.actions;
  if (actions instanceof Collection) {
    if (
      (actions as __esri.Collection<__esri.ActionButton | __esri.ActionToggle>)
        .length
    ) {
      const action = actions.find((a) => a.id === "assign-csaid");
      if (action) {
        action.visible = actionVisible;
      }
    }
  }
};

export const getParcelRelatedAccounts = async (
  parcels: __esri.Graphic[],
  parcelLayer: __esri.FeatureLayer,
  accountsTable: __esri.FeatureLayer
): Promise<__esri.Graphic[]> => {
  const oids = parcels.map((parcel) => parcel.getAttribute("OBJECTID"));
  const relationship = parcelLayer.relationships?.find(
    (relationship) => relationship.name === "Account"
  );

  const results = await parcelLayer.queryRelatedFeatures({
    objectIds: oids,
    relationshipId: relationship?.id,
    outFields: ["*"],
  });
  const accounts = oids.flatMap((oid) =>
    results[oid]?.features.map((feature: __esri.Graphic) => {
      const parcel = parcels.find((p) => p.getAttribute("OBJECTID") === oid);
      if (parcel) {
        feature.setAttribute("SiteAddress", parcel.getAttribute("SiteAddress"));
      }
      feature.layer = accountsTable;
      return feature;
    })
  );

  return accounts;
};

export const addParcelGraphic = (
  parcel: __esri.Graphic,
  parcels: __esri.Graphic[],
  arcgisMap: HTMLArcgisMapElement,
  parcelLayerView: __esri.FeatureLayerView,
  highlight: RefObject<__esri.Handle | null>
) => {
  arcgisMap.graphics.removeAll();
  parcel.symbol = {
    type: "simple-fill",
    style: "none",
    outline: {
      type: "simple-line",
      color: "yellow",
      width: 3,
    },
  };
  arcgisMap?.graphics.add(parcel);

  highlight.current?.remove();
  highlight.current = parcelLayerView.highlight(
    parcels.filter(
      (p) => p.getAttribute("OBJECTID") !== parcel.getAttribute("OBJECTID")
    )
  );
};



export const popupSelectionChanged = (
  selectedFeature: __esri.Graphic | nullish,
  parcelGeometry: __esri.GeometryUnion | nullish
) => {
  let actionVisible = false;
  if (selectedFeature && parcelGeometry) {
    if (selectedFeature.layer) {
      if (
        selectedFeature.layer.title === "Address Points" &&
        selectedFeature.geometry
      ) {
        actionVisible = addressOnParcel(
          parcelGeometry,
          selectedFeature.geometry
        );
      }
    }
    setCsaIdActionVisibility(
      actionVisible,
      selectedFeature.layer as __esri.FeatureLayer
    );
  }
};
