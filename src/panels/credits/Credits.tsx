import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-input-date-picker";
import "@esri/calcite-components/components/calcite-input-number";
import "@esri/calcite-components/components/calcite-text-area";

import { convertToDateString } from "../../utils";
import useCredits from "./useCredits";
interface Props {
  account: __esri.Graphic | undefined;
  credits: __esri.Graphic[];
  creditsTable: __esri.FeatureLayer | null;
  onCreditsUpdate: (graphics: __esri.Graphic[]) => void;
}

const Credits: React.FC<Props> = ({
  account,
  credits,
  creditsTable,
  onCreditsUpdate,
}) => {
  const {
    editing,
    editingClicked,
    flowItemBack,
    credit,
    attributes,
    attributeInputNumberChanged,
    attributeInputDateChanged,
    attributeTextAreaChanged,
    attributeSelectChanged,
    addOrUpdateCredit,
    deleteCredit,
  } = useCredits(account, credits, creditsTable, onCreditsUpdate);

  return (
    <calcite-block heading="Credits" collapsible open>
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
          {account && credit && (
            <calcite-table caption={"Credits"} striped>
              <calcite-table-row>
                <calcite-table-cell>Controlled Surface</calcite-table-cell>
                <calcite-table-cell>{`${(
                  credit.getAttribute("ControlledSurface") as number
                ).toLocaleString()} ft²`}</calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>
                  NPDES MS4 Permit/GI/LID/Other
                </calcite-table-cell>
                <calcite-table-cell>{`${
                  credit.getAttribute("NpdesPercentage") * 100
                }%`}</calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>On-site</calcite-table-cell>
                <calcite-table-cell>{`${
                  credit.getAttribute("OnsitePercentage") * 100
                }%`}</calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>Upstream</calcite-table-cell>
                <calcite-table-cell>{`${
                  credit.getAttribute("UpstreamPercentage") * 100
                }%`}</calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>Inception Date</calcite-table-cell>
                <calcite-table-cell>
                  {convertToDateString(credit.getAttribute("InceptionDate"))}
                </calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>Expires</calcite-table-cell>
                <calcite-table-cell>
                  {convertToDateString(credit.getAttribute("ExpirationDate"))}
                </calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>Approved</calcite-table-cell>
                <calcite-table-cell>
                  {convertToDateString(credit.getAttribute("ApprovalDate"))}
                </calcite-table-cell>
              </calcite-table-row>
              <calcite-table-row>
                <calcite-table-cell>Comment</calcite-table-cell>
                <calcite-table-cell>{`${credit.getAttribute(
                  "Comment"
                )}`}</calcite-table-cell>
              </calcite-table-row>
            </calcite-table>
          )}
          {!account && <div>No account selected</div>}
          {account && !credit && "No credits on account"}
        </calcite-flow-item>
        <calcite-flow-item
          selected={editing}
          heading="Update Credits"
          oncalciteFlowItemBack={flowItemBack}
        >
          <form onSubmit={addOrUpdateCredit} method="POST">
            <calcite-label>
              Controlled Surface
              <calcite-input-number
                name="ControlledSurface"
                min={0}
                suffixText="ft²"
                value={attributes.ControlledSurface?.toString()}
                oncalciteInputNumberChange={attributeInputNumberChanged}
                required
              ></calcite-input-number>
            </calcite-label>

            <calcite-label>
              Upstream
              <calcite-select
                name={"UpstreamPercentage"}
                label={"UpstreamPercentage"}
                oncalciteSelectChange={attributeSelectChanged}
              >
                {(
                  creditsTable?.getFieldDomain(
                    "UpstreamPercentage"
                  ) as __esri.CodedValueDomain
                )?.codedValues.map((cv) => (
                  <calcite-option
                    key={cv.code}
                    value={cv.code}
                    selected={cv.code === attributes.UpstreamPercentage}
                    required
                  >
                    {cv.name}
                  </calcite-option>
                ))}
              </calcite-select>
            </calcite-label>
            <calcite-label>
              On-Site
              <calcite-select
                name={"OnsitePercentage"}
                label={"OnsitePercentage"}
                oncalciteSelectChange={attributeSelectChanged}
              >
                {(
                  creditsTable?.getFieldDomain(
                    "OnsitePercentage"
                  ) as __esri.CodedValueDomain
                )?.codedValues.map((cv) => (
                  <calcite-option
                    key={cv.code}
                    value={cv.code}
                    selected={cv.code === attributes.OnsitePercentage}
                    required
                  >
                    {cv.name}
                  </calcite-option>
                ))}
              </calcite-select>
            </calcite-label>
            <calcite-label>
              NPDES
              <calcite-input-number
                name="NpdesPercentage"
                min={0}
                max={50}
                suffixText="%"
                value={(attributes.NpdesPercentage * 100)?.toString()}
                oncalciteInputNumberChange={attributeInputNumberChanged}
                required
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Approval Date
              <calcite-input-date-picker
                label="ApprovalDate"
                name="ApprovalDate"
                value={attributes.ApprovalDate?.toISOString()}
                oncalciteInputDatePickerChange={attributeInputDateChanged}
                required
              ></calcite-input-date-picker>
            </calcite-label>
            <calcite-label>
              Inception Date
              <calcite-input-date-picker
                label="InceptionDate"
                name="InceptionDate"
                value={attributes.InceptionDate?.toISOString()}
                oncalciteInputDatePickerChange={attributeInputDateChanged}
                required
              ></calcite-input-date-picker>
            </calcite-label>
            <calcite-label>
              Comment
              <calcite-text-area
                value={attributes.Comment}
                name="Comment"
                label="Comment"
                maxLength={150}
                oncalciteTextAreaChange={attributeTextAreaChanged}
              ></calcite-text-area>
            </calcite-label>
            <calcite-button width="full" type="submit" kind="brand">
              {credit ? "Update " : "Add "} Credit
            </calcite-button>
            <br />
            {credit && (
              <calcite-button width="full" kind="danger" onClick={deleteCredit}>
                Delete Credit
              </calcite-button>
            )}
          </form>
        </calcite-flow-item>
      </calcite-flow>
    </calcite-block>
  );
};

export default Credits;
