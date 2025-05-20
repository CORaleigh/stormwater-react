import { FormEvent, useEffect, useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
const useAccounts = (
    account: __esri.Graphic | undefined,
    accounts: __esri.Graphic[],
    accountsTable: __esri.FeatureLayer | null,
    onAccountUpdate: (account: __esri.Graphic) => void
) => {
    const [editing, setEditing] = useState<boolean>(false);
    const [premiseId, setPremiseId] = useState<string>(
      account?.getAttribute("PremiseId")
    );
    const [csaId, setCsaId] = useState<string>(account?.getAttribute("CsaId"));
    const [status, setStatus] = useState<string>(account?.getAttribute("Status"));
    const [useClass, setUseClass] = useState<string>(
      account?.getAttribute("UseClass")
    );
  
    const editingClicked = () => {
      setEditing(!editing);
    };
  
    const editSelectChanged = (
      event: TargetedEvent<HTMLCalciteSelectElement, undefined>
    ) => {
      if (event.target.label === "Status") {
        setStatus(event.target.selectedOption.value);
      }
      if (event.target.label === "UseClass") {
        setUseClass(event.target.selectedOption.value);
      }
    };
    const editInputChanged = (
      event: TargetedEvent<HTMLCalciteInputElement, undefined>
    ) => {
      if (event.target.label === "CSA ID") {
        setCsaId(event.target.value);
      }
      if (event.target.label === "Premise ID") {
        setPremiseId(event.target.value);
      }
    };
    useEffect(() => {
      if (account) {
        setPremiseId(account.getAttribute("PremiseId"));
        setCsaId(account.getAttribute("CsaId"));
        setStatus(account.getAttribute("Status"));
        setUseClass(account.getAttribute("UseClass"));
      }
    }, [account]);
  
  
    const updateAccount = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setEditing(false);
      if (account) {
        account.setAttribute("PremiseId", premiseId);
        account.setAttribute("CsaId", csaId);
        account.setAttribute("Status", status);
        account.setAttribute("UseClass", useClass);
        const result = await accountsTable?.applyEdits({
          updateFeatures: [account],
        });
        if (result?.updateFeatureResults.length) {
          if (result.updateFeatureResults[0].objectId) {
            const newResults = await accountsTable?.queryFeatures({
              objectIds: [result.updateFeatureResults[0].objectId],
              outFields: ["*"],
            });
  
            if (newResults?.features.length) {
              onAccountUpdate(newResults.features[0]);
            }
          }
        }
      }
    };
  
    const flowItemBack = () => {
      setEditing(!editing);
    };
  
    const selectedAccountChange = (
      event: TargetedEvent<HTMLCalciteSelectElement, undefined>
    ) => {
      const selectedAccount = accounts.find(
        (a) => a.getAttribute("OBJECTID") === event.target.value
      );
      if (selectedAccount) {
        onAccountUpdate(selectedAccount);
      }
    };


  return {
    editing,
    editingClicked,
    flowItemBack,
    updateAccount,
    selectedAccountChange,
    editInputChanged,
    editSelectChanged,
    csaId,
    premiseId
  };
};

export default useAccounts;
