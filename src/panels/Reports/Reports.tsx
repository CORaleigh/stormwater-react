import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import { getDomainLabel } from "../../utils";
import useReports from "./useReports";

interface Props {
  selectedPanel: string | undefined;
  accountsTable: __esri.FeatureLayer;
  onAccountUpdate: (account: __esri.Graphic) => void;
}

const Reports: React.FC<Props> = ({
  selectedPanel,
  accountsTable,
  onAccountUpdate,
}) => {
  const { reportResults, reportSelected, resultSelected } = useReports(
    accountsTable,
    onAccountUpdate
  );

  return (
    <calcite-panel closed={selectedPanel !== "Reports"}>
      <calcite-select
        label={"Report Selection"}
        oncalciteSelectChange={reportSelected}
      >
        <calcite-option value="pending">Pending Accounts</calcite-option>
        <calcite-option value="onhold">On Hold Accounts</calcite-option>
        <calcite-option value="retired-parcel">
          Active Accounts Retired Parcel
        </calcite-option>
      </calcite-select>
      <calcite-table
        caption={"Reports"}
        selectionMode="single"
        oncalciteTableSelect={resultSelected}
        bordered
        striped
        selectionDisplay="none"
        scale="s"
      >
        <calcite-table-row slot="table-header">
          <calcite-table-header heading="Site Address"></calcite-table-header>
          <calcite-table-header heading="Account ID"></calcite-table-header>
          <calcite-table-header heading="Premise ID"></calcite-table-header>
          <calcite-table-header heading="REID"></calcite-table-header>
          <calcite-table-header heading="Status"></calcite-table-header>
        </calcite-table-row>
        {reportResults.map((account) => (
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
              {account.getAttribute("PremiseId")}
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

export default Reports;
