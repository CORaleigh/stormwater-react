import { TargetedEvent } from "@esri/calcite-components";
const useResultsTable = (
    accountResults: __esri.Graphic[],
    onAccountUpdate: (account: __esri.Graphic) => void
) => {
    const resultSelected = (event: TargetedEvent<HTMLCalciteTableElement, undefined>) => {
        const oid = event.target.selectedItems[0].dataset["oid"];
        if (oid) {
          const account = accountResults.find(
            (account) => account.getAttribute("OBJECTID") === parseInt(oid)
          );
          if (account) {
            onAccountUpdate(account);
          }
        }
    }    
    return {
        resultSelected
    };
  };



export default useResultsTable;
