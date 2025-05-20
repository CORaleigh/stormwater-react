import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-action";

import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-text-area";

import { convertToDateString } from "../../utils";
import useJournal from "./useJournal";

interface Props {
  account: __esri.Graphic | undefined;
  journals: __esri.Graphic[];
  journalsTable: __esri.FeatureLayer | null;
  onJournalAdd: (graphic: __esri.Graphic) => void;
}

const Journals: React.FC<Props> = ({
  account,
  journals,
  journalsTable,
  onJournalAdd,
}) => {

  const {
    editing,
    editingClicked,
    flowItemBack,
    entryChanged,
    addJournalEntry,
  } = useJournal(account, journalsTable, onJournalAdd);
  return (
    <calcite-block heading="Journals" collapsible open>
      <calcite-action
        slot="actions-end"
        icon="pencil"
        text={"Update"}
        kind="outline"
        onClick={editingClicked}
        active={editing}
        disabled={!account}
      ></calcite-action>

      <calcite-flow>
        <calcite-flow-item selected={!editing}>
          {account && journals.length > 0 && (
            <>
              <calcite-table caption={"Journal entries"} striped bordered pageSize={10}>
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
                {journals
                  .map((record) => (
                    <calcite-table-row key={record.getAttribute("OBJECTID")}>
                      <calcite-table-cell>
                        {convertToDateString(
                          record.getAttribute("created_date")
                        )}
                      </calcite-table-cell>
                      <calcite-table-cell>
                        {record.getAttribute("created_user")}
                      </calcite-table-cell>
                      <calcite-table-cell>
                        {record.getAttribute("JournalEntry")}
                      </calcite-table-cell>
                    </calcite-table-row>
                  ))}
              </calcite-table>
            </>
          )}
          {!account && <div>No account selected</div>}
          {account && journals.length === 0 && <div>No journal entries</div>}
        </calcite-flow-item>
        <calcite-flow-item
          selected={editing}
          heading="Add Journal Entry"
          oncalciteFlowItemBack={flowItemBack}
        >
          <calcite-label>
            Entry
            <calcite-text-area
              oncalciteTextAreaChange={entryChanged}
            ></calcite-text-area>
          </calcite-label>
          <calcite-button width="full" onClick={addJournalEntry}>
            Add Journal Entry
          </calcite-button>
        </calcite-flow-item>
      </calcite-flow>
    </calcite-block>
  );
};

export default Journals;
