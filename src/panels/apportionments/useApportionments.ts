import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
import { updateTableLayer } from "./apportionSources";
const useApportionments = (
  account: __esri.Graphic | undefined,
  apportionments: __esri.Graphic[]
) => {
  const [editing, setEditing] = useState<boolean>(false);

  const [code, setCode] = useState<string>(
    account?.getAttribute("ApportionmentCode")
  );
  const [units, setUnits] = useState<number>(
    account?.getAttribute("ApportionmentUnits")
  );
  const [percentAvailable, setPercentAvailable] = useState<number>(0);

  const featureTable = useRef<HTMLArcgisFeatureTableElement>(null);
  const [newApportionments, setNewApportionments] = useState<__esri.Graphic[]>(
    []
  );
  const [step, setStep] = useState<"set_accounts" | "set_percent">(
    "set_accounts"
  );
  const editingClicked = () => {
    setEditing(!editing);
  };
  const flowItemBack = () => {
    setStep("set_accounts");
  };

  const codeChanged = (
    event: TargetedEvent<HTMLCalciteSelectElement, undefined>
  ) => {
    account?.setAttribute(
      "ApportionmentCode",
      event.target.selectedOption.value
    );
    setCode(event.target.selectedOption.value);
  };
  const unitsChanged = (
    event: TargetedEvent<HTMLCalciteInputNumberElement, undefined>
  ): void => {
    setUnits(parseInt(event.target.value));
  };

  const suggestStart = (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchSuggestStartEvent
    >
  ) => {
    console.log(event.detail);
  };

  const searchComplete = async (
    event: TargetedEvent<
      HTMLArcgisSearchElement,
      __esri.SearchSearchCompleteEvent
    >
  ) => {
    const features = event.detail.results[0].results.map((result) => {
      return result;
    });
    await updateTableLayer(features as unknown as __esri.Graphic[], featureTable.current);
    featureTable.current?.refresh();
  };

  const tableSelectionChanged = useCallback(
    async (
      event: TargetedEvent<
        HTMLArcgisFeatureTableElement,
        __esri.CollectionChangeEvent<string | number>
      >
    ) => {
      const accounts = await (
        event.target.layer as __esri.FeatureLayer
      ).queryFeatures({
        objectIds: event.target.highlightIds.toArray(),
        outFields: ["*"],
        returnGeometry: false,
      });
      setNewApportionments(accounts.features);
    },
    []
  );

  const isDisabled = useMemo(() => {
    return apportionments.length + newApportionments.length !== units;
  }, [apportionments, newApportionments, units]);

  const nextFlow = () => {
    const percent = 1 / units;
    newApportionments.forEach((appt) =>
      appt.setAttribute("PercentApportioned", code === "EQUAL" ? percent : 0)
    );
    setStep("set_percent");
  };

  useEffect(() => {
    //const percent = 1 / units;
    // newApportionments.forEach((appt) =>
    //   appt.setAttribute("PercentApportioned", code === 'EQUAL' ? percent : 0)
    // );
    if (code === "WEIGHTED") {
      let total = 0;
      apportionments.forEach(
        (appt) => (total += parseFloat(appt.getAttribute("PercentApportioned")))
      );

      newApportionments.forEach(
        (appt) => (total += parseFloat(appt.getAttribute("PercentApportioned")))
      );

      setPercentAvailable(1 - parseFloat(total.toFixed(10)));
    }
  }, [newApportionments, apportionments, units, code]);

  useEffect(() => {
    setCode(account?.getAttribute("ApportionmentCode"));
    setNewApportionments([]);
  }, [account]);

  return {
    editing,
    editingClicked,
    flowItemBack,
    percentAvailable,
    step,
    codeChanged,
    unitsChanged,
    suggestStart,
    searchComplete,
    tableSelectionChanged,
    isDisabled,
    nextFlow,
    code,
    units,
    newApportionments,
    setNewApportionments,    
    featureTable
  };
};

export default useApportionments;
