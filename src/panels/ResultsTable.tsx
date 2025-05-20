import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import { getDomainLabel } from "../utils";
import useResultsTable from "./useResultsTable";

interface Props {
  accountResults: __esri.Graphic[];
  onAccountUpdate: (account: __esri.Graphic) => void;
  selectedPanel: string;
  accountsTable: __esri.FeatureLayer;
}

const ResultsTable: React.FC<Props> = ({
  accountResults,
  onAccountUpdate,
  selectedPanel,
  accountsTable,
}) => {
  const { resultSelected } = useResultsTable(accountResults, onAccountUpdate);
  return (
    <calcite-panel closed={selectedPanel !== "Results"}>
      <calcite-table
        caption={"Results"}
        selectionMode="single"
        oncalciteTableSelect={resultSelected}
        striped
        bordered
      >
        <calcite-table-row slot="table-header">
          <calcite-table-header heading="Site Address"></calcite-table-header>
          <calcite-table-header heading="Account ID"></calcite-table-header>
          <calcite-table-header heading="REID"></calcite-table-header>
          <calcite-table-header heading="Status"></calcite-table-header>
        </calcite-table-row>
        {accountResults.map((account) => (
          <calcite-table-row
            key={account.getAttribute("OBJECTID")}
            data-oid={account.getAttribute("OBJECTID")}
          >
            <calcite-table-cell>
              {account?.getAttribute("SiteAddress")}
            </calcite-table-cell>
            <calcite-table-cell>
              {account.getAttribute("AccountId")}
            </calcite-table-cell>
            <calcite-table-cell>
              {account.getAttribute("RealEstateId")}
            </calcite-table-cell>
            <calcite-table-cell>
              {getDomainLabel(
                accountsTable,
                "Status",
                account.getAttribute("Status")
              )}
            </calcite-table-cell>
          </calcite-table-row>
        ))}
      </calcite-table>
    </calcite-panel>
  );
};

export default ResultsTable;
