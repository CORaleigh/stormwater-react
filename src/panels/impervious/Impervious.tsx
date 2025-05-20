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

import { convertToDateString, getDomainLabel } from "../../utils";
import useImpervious from "./useImpervious";
interface Props {
  account: __esri.Graphic | undefined;
  imperviousSurfaces: __esri.Graphic[];
  imperviousTable: __esri.FeatureLayer | null;
  onImperviousAdd: (graphic: __esri.Graphic) => void;
}

const Impervious: React.FC<Props> = ({
  account,
  imperviousSurfaces,
  imperviousTable,
  onImperviousAdd,
}) => {

  const {
    editing,
    editingClicked,
    flowItemBack,
    attributes,
    attributeInputChanged,
    addImperviousSurface,
  } = useImpervious(account, imperviousSurfaces, onImperviousAdd);

  return (
    <calcite-block heading="Impervious" collapsible open>
      <calcite-action
        slot="actions-end"
        icon="pencil"
        text={"Update"}
        kind="outline"
        onClick={editingClicked}
        active={editing}
        disabled={!account}
      ></calcite-action>

      {account && imperviousTable && (
        <calcite-flow>
          <calcite-flow-item selected={!editing}>
            <calcite-table caption={"Impervious Surface Records"} striped bordered pageSize={10}>
              <calcite-table-row slot="table-header">
                <calcite-table-header heading="Effective"></calcite-table-header>
                <calcite-table-header
                  heading="Total"
                  description="ft²"
                ></calcite-table-header>
                <calcite-table-header heading="Method"></calcite-table-header>
                <calcite-table-header heading="Method Date"></calcite-table-header>
                <calcite-table-header heading="Status"></calcite-table-header>
              </calcite-table-row>
              {imperviousSurfaces
                .map((record) => (
                  <calcite-table-row key={record.getAttribute("OBJECTID")}>
                    <calcite-table-cell>
                      {record.getAttribute("EffectiveDate") &&
                        convertToDateString(
                          record.getAttribute("EffectiveDate")
                        )}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {(
                        record.getAttribute("TotalImpervious") as number
                      ).toLocaleString()}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {record.getAttribute("MethodUsed")}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {convertToDateString(record.getAttribute("MethodDate"))}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {getDomainLabel(
                        imperviousTable,
                        "Status",
                        record.getAttribute("Status")
                      )}
                    </calcite-table-cell>
                  </calcite-table-row>
                ))}
            </calcite-table>
          </calcite-flow-item>
          <calcite-flow-item
            selected={editing}
            heading="Add Impervious Surface"
            oncalciteFlowItemBack={flowItemBack}
          >
            <calcite-label>
              Building
              <calcite-input-number
                label="BuildingImpervious"
                value={attributes.BuildingImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Parking
              <calcite-input-number
                label="ParkingImpervious"
                value={attributes.ParkingImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Recreation
              <calcite-input-number
                label="RecreationImpervious"
                value={attributes.RecreationImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Road/Trail
              <calcite-input-number
                label="RoadTrailImpervious"
                value={attributes.RoadTrailImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Miscellaneous
              <calcite-input-number
                label="MiscImpervious"
                value={attributes.MiscImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Other
              <calcite-input-number
                label="OtherImpervious"
                value={attributes.OtherImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Permitted
              <calcite-input-number
                label="PermittedImpervious"
                value={attributes.PermittedImpervious?.toString()}
                min={0}
                oncalciteInputNumberChange={attributeInputChanged}
              ></calcite-input-number>
            </calcite-label>
            <calcite-label>
              Method Date
              <calcite-input-date-picker
                label="MethodDate"
                value={attributes.MethodDate?.toISOString()}
              ></calcite-input-date-picker>
            </calcite-label>
            <calcite-label>
              Effective Date
              <calcite-input-date-picker
                label="EffectiveDate"
                value={attributes.EffectiveDate?.toISOString()}
              ></calcite-input-date-picker>
            </calcite-label>
            <calcite-button
              width="full"
              kind="brand"
              onClick={addImperviousSurface}
            >
              Add Impervious Surface
            </calcite-button>
          </calcite-flow-item>
        </calcite-flow>
      )}

      {!account && <div>No account selected</div>}
      {account && imperviousSurfaces.length === 0 && (
        <div>No impervious records</div>
      )}
    </calcite-block>
  );
};

export default Impervious;
