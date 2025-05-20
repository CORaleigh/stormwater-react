import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import { convertToDateString } from "../../utils";

interface Props {
  account: __esri.Graphic | undefined;
  logs: __esri.Graphic[];
}

const Logs: React.FC<Props> = ({ account, logs }) => {

  return (
    <calcite-block heading="Logs" collapsible open>
      {account && logs.length > 0 && (<>
        <calcite-table caption={"Logs"} striped pageSize={10} bordered>
          <calcite-table-row slot="table-header">
            <calcite-table-header
              heading="Date"
              description="Date"
            ></calcite-table-header>
            <calcite-table-header
              heading="User"
              description="User"
            ></calcite-table-header>
            <calcite-table-header
              heading="Entry"
              description="Entry"
            ></calcite-table-header>
          </calcite-table-row>
          {logs.map((record) => (
            <calcite-table-row key={record.getAttribute("OBJECTID")}>
              <calcite-table-cell>
                {convertToDateString(record.getAttribute("created_date"))}
              </calcite-table-cell>
              <calcite-table-cell>
                {record.getAttribute("created_user")}
              </calcite-table-cell>
              <calcite-table-cell>
                {record.getAttribute("LogEntry")}
              </calcite-table-cell>
            </calcite-table-row>
          ))}
        </calcite-table>

        </>
      )}
      {!account && <div>No account selected</div>}
      {account && logs.length === 0 && <div>No log entries</div>}
    </calcite-block>
  );
};

export default Logs;
