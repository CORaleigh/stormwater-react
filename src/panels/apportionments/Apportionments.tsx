import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-label";

import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-input-number";

import "@esri/calcite-components/components/calcite-dialog";
import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";

import { TargetedEvent } from "@esri/calcite-components";

import {
  getApportionmentSources,
  getApportionmentTableLayer,
  hiddenFields,
} from "./apportionSources";
import useApportionments from "./useApportionments";
import React from "react";

interface Props {
  account: __esri.Graphic | undefined;
  apportionments: __esri.Graphic[];
  apportionmentsTable: __esri.FeatureLayer | null;
  accountsTable: __esri.FeatureLayer | null;
  arcgisMap: HTMLArcgisMapElement | null;
  parcelLayer: __esri.FeatureLayer | null;
}

const Apportionments: React.FC<Props> = ({
  account,
  apportionments,
  apportionmentsTable,
  accountsTable,
  arcgisMap,
  parcelLayer,
}) => {

  const {
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
    featureTable,
  } = useApportionments(account, apportionments);
  return (
    <>
      <calcite-block heading="Apportionments" collapsible open>
        <calcite-action
          slot="actions-end"
          icon="pencil"
          text={"Update"}
          kind="outline"
          onClick={editingClicked}
          active={editing}
          disabled={
            !account || units === apportionments.length || code === "NA"
          }
        ></calcite-action>
        {account && (
          <div className="apportion-settings">
            <calcite-label>
              Code
              <calcite-select
                label={"Code"}
                width="full"
                value={code}
                oncalciteSelectChange={codeChanged}
                selected={account.getAttribute("ApportionmenCode")}
              >
                <calcite-option value={"NA"}>N/A</calcite-option>
                <calcite-option value={"WEIGHTED"}>Weighted</calcite-option>
                <calcite-option value={"EQUAL"}>Equal</calcite-option>
              </calcite-select>
            </calcite-label>
            <calcite-label width="full">
              Units
              <calcite-input-number
                min={0}
                value={(
                  account?.getAttribute("ApportionmentUnits") as number
                ).toFixed(0)}
                disabled={account?.getAttribute("ApportionmentCode") === "NA"}
                oncalciteInputNumberChange={unitsChanged}
              ></calcite-input-number>
            </calcite-label>
          </div>
        )}

        {account && apportionments.length > 0 && (
          <>
            <calcite-table caption={"Apportionments"} striped pageSize={10}>
              <calcite-table-row slot="table-header">
                <calcite-table-header heading="ID"></calcite-table-header>
                <calcite-table-header heading="Premise ID"></calcite-table-header>
                <calcite-table-header heading="Address"></calcite-table-header>
                <calcite-table-header heading="Percent"></calcite-table-header>
                <calcite-table-header heading="SFEU"></calcite-table-header>
                <calcite-table-header
                  heading="Impervious"
                  description="ft²"
                ></calcite-table-header>
              </calcite-table-row>
              {apportionments
                .map((record) => (
                  <calcite-table-row key={record.getAttribute("OBJECTID")}>
                    <calcite-table-cell>
                      {record.getAttribute("OBJECTID")}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {record.getAttribute("PremiseId")}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {record.getAttribute("Address")}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {`${record.getAttribute("PercentApportioned") * 100}%`}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {record.getAttribute("Sfeu")}
                    </calcite-table-cell>
                    <calcite-table-cell>
                      {(
                        record.getAttribute("Impervious") as number
                      ).toLocaleString()}
                    </calcite-table-cell>
                  </calcite-table-row>
                ))}
            </calcite-table>

          </>
        )}
        {!account && <div>No account selected</div>}
        {account && apportionments.length === 0 && (
          <div>Account not apportioned</div>
        )}
      </calcite-block>
      <calcite-dialog open={editing} scale="l" heading="Add Apportionments">
        <calcite-flow>
          {percentAvailable}
          <calcite-flow-item
            selected={step === "set_accounts"}
            heading="Select accounts"
          >
            {editing && arcgisMap && (
              <arcgis-search
                includeDefaultSourcesDisabled
                sources={getApportionmentSources(arcgisMap)}
                onarcgisComplete={searchComplete}
                onarcgisSuggestStart={suggestStart}
              ></arcgis-search>
            )}
            {editing && (
              <arcgis-feature-table
                key={"table"}
                ref={featureTable}
                referenceElement={arcgisMap}
                hiddenFields={hiddenFields}
                layer={getApportionmentTableLayer(accountsTable)}
                onarcgisSelectionChange={tableSelectionChanged}
              ></arcgis-feature-table>
            )}
          </calcite-flow-item>
          <calcite-flow-item
            selected={step === "set_percent"}
            heading="Set Percents"
            oncalciteFlowItemBack={flowItemBack}
          >
            <calcite-list label={""}>
              {newApportionments.map((appt) => (
                <calcite-list-item>
                  <div slot="content-start">
                    {appt.getAttribute("SiteAddress")}
                  </div>
                  <calcite-input-number
                    key={appt.getAttribute("AccountId")}
                    disabled={code === "EQUAL"}
                    value={(
                      appt.getAttribute("PercentApportioned") * 100
                    ).toString()}
                    slot="content-end"
                    oncalciteInputNumberChange={(
                      event: TargetedEvent<
                        HTMLCalciteInputNumberElement,
                        undefined
                      >
                    ) => {
                      const value = parseFloat(event.target.value) / 100;
                      appt.setAttribute("PercentApportioned", value);
                      const filtered = newApportionments.filter(
                        (newAppt) =>
                          newAppt.getAttribute("AccountId") !==
                          appt.getAttribute("AccountId")
                      );
                      setNewApportionments([...filtered, appt]);
                    }}
                  ></calcite-input-number>
                </calcite-list-item>
              ))}
            </calcite-list>
          </calcite-flow-item>
        </calcite-flow>

        {step === "set_accounts" && (
          <calcite-button
            disabled={isDisabled}
            onClick={nextFlow}
            slot="footer-end"
          >
            Next
          </calcite-button>
        )}
        {step === "set_percent" && code === "EQUAL" && (
          <calcite-button disabled={isDisabled} slot="footer-end">
            Next
          </calcite-button>
        )}
      </calcite-dialog>
    </>
  );
};

export default React.memo(Apportionments);
