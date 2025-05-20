import { SetStateAction, useEffect, useRef, useState } from "react";
import { authenticate } from "./authenticate";
import { getAccountRelatedFeatures, getTableByTitle } from "./sources";
import { TargetedEvent } from "@esri/calcite-components";
import { BillDetails, getBilling } from "./panels/billing/getBilling";
import { getSearchSources } from "./sources";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

import {
  addParcelGraphic,
  getParcelRelatedAccounts,
  getParcelsAtHoldPoint,
  popupSelectionChanged,
} from "./mapUtils";
const useApp = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const env = searchParams.get("env") || "prod";
  const isTest = env === "test";
  const [user, setUser] = useState<__esri.PortalUser | nullish>();
  const [imperviousSurfaces, setImperviousSurfaces] = useState<
    __esri.Graphic[]
  >([]);
  const [apportionments, setApportionments] = useState<__esri.Graphic[]>([]);
  const [credits, setCredits] = useState<__esri.Graphic[]>([]);
  const [journals, setJournals] = useState<__esri.Graphic[]>([]);
  const [logs, setLogs] = useState<__esri.Graphic[]>([]);
  const [bill, setBill] = useState<BillDetails>();
  const [account, setAccount] = useState<__esri.Graphic>();
  const [accounts, setAccounts] = useState<__esri.Graphic[]>([]);
  const [parcel, setParcel] = useState<__esri.Graphic>();
  const [parcels, setParcels] = useState<__esri.Graphic[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string>("Account");
  const [accountResults, setAccountResults] = useState<__esri.Graphic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const arcgisMap = useRef<HTMLArcgisMapElement>(null);
  const arcgisSearch = useRef<HTMLArcgisSearchElement>(null);
  const parcelLayer = useRef<__esri.FeatureLayer>(null);
  const parcelLayerView = useRef<__esri.FeatureLayerView>(null);
  const accountsTable = useRef<__esri.FeatureLayer>(null);
  const imperviousTable = useRef<__esri.FeatureLayer>(null);
  const journalsTable = useRef<__esri.FeatureLayer>(null);
  const creditsTable = useRef<__esri.FeatureLayer>(null);
  const apportionmentsTable = useRef<__esri.FeatureLayer>(null);
  const addressPointsLayer = useRef<__esri.FeatureLayer>(null);
  const highlight = useRef<__esri.Handle>(null);
  const parcelGeometry = useRef<nullish | __esri.GeometryUnion>(null);

  useEffect(() => {
    if (parcel && arcgisMap.current) {
      arcgisMap.current.goTo(parcel);
      const accountTable = getTableByTitle(arcgisMap.current, "Accounts");
      const getRelatedRecords = async () => {
        const accountResults = await getAccountRelatedFeatures(
          parcel,
          "Account",
          ["Status"]
        );
        if (accountResults) {
          accountResults.forEach((result) => (result.layer = accountTable));
          setAccountResults(accountResults);
        }
      };

      getRelatedRecords();
    }
    if (parcel === undefined) {
      setAccount(undefined);
    }
  }, [arcgisMap, parcel]);

  useEffect(() => {
    if (account) {
      setParcel(undefined)
      const getRelatedRecords = async () => {
        setLoading(true);
        const parcelResults = await getAccountRelatedFeatures(
          account,
          "Property"
        );
        if (parcelResults) {
          setParcel(parcelResults[0]);
        }
        const imperviousResults = await getAccountRelatedFeatures(
          account,
          `${isTest ? "StormWater.DBO." : ""}ImperviousSurface`,
          ["MethodDate desc"]
        );
        if (imperviousResults) {
          setImperviousSurfaces(imperviousResults);
        }
        const apportionmentResults = await getAccountRelatedFeatures(
          account,
          `${isTest ? "StormWater.DBO." : ""}Apportionment`
        );
        setApportionments(apportionmentResults ? apportionmentResults : []);
        const creditResults = await getAccountRelatedFeatures(
          account,
          `${isTest ? "StormWater.DBO." : ""}Credit`
        );
        setCredits(creditResults ? creditResults : []);

        const journalResults = await getAccountRelatedFeatures(
          account,
          `${isTest ? "StormWater.DBO." : ""}Journal`
        );
        setJournals(journalResults ? journalResults : []);

        const logResults = await getAccountRelatedFeatures(
          account,
          `${isTest ? "StormWater.DBO." : ""}Log`,
          ["created_date desc"]
        );
        setLogs(logResults ? logResults : []);
        const billing = await getBilling(account.getAttribute("PremiseId"));
        if (billing) {
          setBill(billing);
        }
        setLoading(false);
      };
      getRelatedRecords();
    }
    if (account === undefined) {
      setImperviousSurfaces([]);
      setApportionments([]);
      setCredits([]);
      setJournals([]);
      setLogs([]);
    }
  }, [account, isTest]);

  useEffect(() => {
    setSelectedPanel(parcels.length > 1 ? "Results" : "Account");
    setAccount(parcels.length === 1 ? accounts[0] : undefined);
  }, [parcels, accounts]);

  useEffect(() => {
    const login = async () => {
      const portalUser = await authenticate(isTest);
      setUser(portalUser);
    };
    login();
  }, [isTest]);

  const onAccountUpdate = (updatedAccount: __esri.Graphic) => {
    setAccount(updatedAccount);
    setSelectedPanel('Account');
  };
  const onImperviousAdd = (addedImpervious: __esri.Graphic) => {
    setImperviousSurfaces([...imperviousSurfaces, addedImpervious]);
  };
  const onJournalAdd = (addedJournal: __esri.Graphic) => {
    setJournals([...journals, addedJournal]);
  };
  const onCreditsUpdate = (updatedCredits: __esri.Graphic[]) => {
    setCredits(updatedCredits);
  };
  const actionBarClick = (event: {
    currentTarget: { text: SetStateAction<string> };
  }) => {
    setSelectedPanel(event.currentTarget.text);
  };


  const arcgisViewReady = async (
    event: TargetedEvent<HTMLArcgisMapElement, void>
  ) => {
    await event.target.view.when();
    const tables = event.target.view.map.tables.map(
      (table) => table as __esri.FeatureLayer
    );
    tables.forEach(async (table) => {
      await table.load();
      if (table.title === "Accounts") {
        accountsTable.current = table;
      }
      if (table.title === "Impervious Surface") {
        imperviousTable.current = table;
      }
      if (table.title === "Journal Entries") {
        journalsTable.current = table;
      }
      if (table.title === "Credits") {
        creditsTable.current = table;
      }
      if (table.title === "Apportionments") {
        apportionmentsTable.current = table;
      }
    });

    if (arcgisSearch.current && arcgisMap.current) {
      arcgisSearch.current.sources = getSearchSources(arcgisMap.current);
    }
   
  };
  useEffect(() => {
    if (arcgisMap && accountsTable.current) {
      const handler = reactiveUtils.on(
        () => arcgisMap.current?.popup,
        "trigger-action",
        async (event) => {
          if (event.action.id === "assign-csaid") {
            const csaid =
              arcgisMap.current?.popup?.selectedFeature?.getAttribute("CSAID");

            if (csaid && account) {
              account.setAttribute("CsaId", csaid);

              const result = await accountsTable.current?.applyEdits({
                updateFeatures: [account],
              });
              if (result?.updateFeatureResults.length) {
                setAccount(account);
                setAccounts((prevAccounts) =>
                  prevAccounts.map((acc) =>
                    acc.getAttribute("OBJECTID") ===
                    account.getAttribute("OBJECTID")
                      ? account
                      : acc
                  )
                );
              }
            }
          }
        }
      );
      const watchHandler = reactiveUtils.watch(
        () => arcgisMap.current?.popup?.selectedFeature,
        (selectedFeature: __esri.Graphic | nullish) =>
          popupSelectionChanged(selectedFeature, parcelGeometry.current)
      );
      return () => {
        handler.remove();
        watchHandler.remove();
      }; // Clean up previous event listener
    }
  }, [arcgisMap, account]);
  const arcgisViewHold = async (
    event: TargetedEvent<HTMLArcgisMapElement, __esri.ViewHoldEvent>
  ) => {
    if (parcelLayer.current && parcelLayerView.current) {
      const hits = await getParcelsAtHoldPoint(
        event.target,
        event.detail.mapPoint,
        parcelLayer.current
      );
      setParcel(hits[0]);
      setParcels(hits);
      highlight.current?.remove();
    }
  };
  const arcgisLayerViewCreate = async (
    event: TargetedEvent<HTMLArcgisMapElement, __esri.ViewLayerviewCreateEvent>
  ) => {
    if (event.detail.layer.title === "Parcels") {
      if (event.detail.layer.type === "feature") {
        const layer = event.detail.layer as __esri.FeatureLayer;
        parcelLayer.current = layer;
        parcelLayerView.current = event.detail
          .layerView as __esri.FeatureLayerView;
        layer.definitionExpression = "RealEstateId is not null";
      }
    }
    if (event.detail.layer.title === "Address Points") {
      addressPointsLayer.current = event.detail.layer as __esri.FeatureLayer;
      const popupTemplate = (event.detail.layer as __esri.FeatureLayer)
        .popupTemplate;
      if (popupTemplate) {
        popupTemplate.actions = [
          {
            type: "button",
            title: "Assign CSAID",
            id: "assign-csaid",
            icon: "check",
          },
        ];
      }
    }
  };
  const arcgisSelectResult = async (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchSearchCompleteEvent
    >
  ) => {
    requestAnimationFrame(() => arcgisSearch.current?.clearSearch());
    if (event.detail.numResults > 0) {
      if (
        ["Site Address", "REID", "PIN", "Street name"].includes(
          event.detail.results[0].source.name
        )
      ) {
        setParcels(
          event.detail.results[0].results.map((result) => result.feature)
        );
        setParcel(
          event.detail.results[0].results.length === 1
            ? event.detail.results[0].results[0].feature
            : undefined
        );
      }
      if (
        ["Account ID", "Premise ID", "CsaId"].includes(
          event.detail.results[0].source.name
        )
      ) {
        setAccount(event.detail.results[0].results[0].feature);
      }
    }
  };

  useEffect(() => {
    const queryRelatedAccounts = async () => {
      if (parcels.length && parcelLayer.current && accountsTable.current) {
        const accounts = await getParcelRelatedAccounts(
          parcels,
          parcelLayer.current,
          accountsTable.current
        );
        highlight.current?.remove();
        if (parcels.length > 1 && parcelLayerView.current) {
          highlight.current = parcelLayerView.current.highlight(parcels);
        }
        arcgisMap.current?.goTo(parcels);
        setAccountResults(accounts);
        setAccount(undefined);
        setParcel(undefined);
        arcgisMap.current?.graphics?.removeAll();
        if (parcels.length === 1) {
          setAccounts(accounts);
        } else {
          setAccounts([]);
        }
      }
    };
    queryRelatedAccounts();
  }, [
    arcgisMap,
    parcels,
    setAccount,
    setAccountResults,
    setAccounts,
    setParcel,
  ]);

  useEffect(() => {
    if (parcel && arcgisMap.current && parcelLayerView.current) {
      parcelGeometry.current = parcel.geometry;
      addParcelGraphic(
        parcel,
        parcels,
        arcgisMap.current,
        parcelLayerView.current,
        highlight
      );
    } else {
      arcgisMap.current?.graphics?.removeAll();
    }
  }, [parcel, arcgisMap, parcels]);

  return {
    isTest,
    user,
    parcel,
    parcels,
    setParcel,
    setParcels,
    account,
    setAccount,
    imperviousSurfaces,
    apportionments,
    accounts,
    setAccounts,
    logs,
    credits,
    journals,
    onAccountUpdate,
    onImperviousAdd,
    onJournalAdd,
    onCreditsUpdate,
    selectedPanel,
    actionBarClick,
    accountResults,
    setAccountResults,
    loading,
    bill,
    arcgisMap,
    arcgisSearch,
    parcelLayer,
    accountsTable,
    imperviousTable,
    apportionmentsTable,
    creditsTable,
    journalsTable,
    arcgisViewReady,
    arcgisLayerViewCreate,
    arcgisViewHold,
    arcgisSelectResult,
  };
};

export default useApp;
