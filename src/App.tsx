import "./App.css";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-navigation-user";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import "@esri/calcite-components/components/calcite-scrim";

import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-basemap-toggle";
import "@arcgis/map-components/components/arcgis-feature-table";

import "@arcgis/map-components/components/arcgis-expand";

import Apportionments from "./panels/apportionments/Apportionments";
import Impervious from "./panels/impervious/Impervious";
import Journals from "./panels/journals/Journals";
import Logs from "./panels/logs/Logs";
import Billing from "./panels/billing/Billing";
import Credits from "./panels/credits/Credits";
import Accounts from "./panels/accounts/Accounts";
import useApp from "./useApp";
import { nextBasemap } from "./mapUtils";
import ResultsTable from "./panels/ResultsTable";
import Reports from "./panels/Reports/Reports";

function App() {
  const {
    isTest,
    user,
    parcel,
    parcels,
    account,
    imperviousSurfaces,
    apportionments,
    accounts,
    logs,
    credits,
    journals,
    onAccountUpdate,
    onImperviousAdd,
    onJournalAdd,
    onCreditsUpdate,
    selectedPanel,
    actionBarClick,
    accountResults,
    loading,
    bill,
    arcgisMap,
    arcgisSearch,
    parcelLayer,
    accountsTable,
    imperviousTable,
    apportionmentsTable,
    creditsTable,
    journalsTable,
    arcgisViewReady,
    arcgisLayerViewCreate,
    arcgisViewHold,
    arcgisSelectResult,
  } = useApp();

  return (
    <>
      <calcite-shell>
        <calcite-navigation slot="header">
          <calcite-navigation-logo
            slot="logo"
            heading="Stormwater Manager"
          ></calcite-navigation-logo>
          <calcite-navigation-user
            slot="user"
            full-name={user?.fullName}
            username={user?.username}
          ></calcite-navigation-user>
        </calcite-navigation>
        <calcite-shell-panel slot="panel-start" width="l">
          <calcite-action-bar slot="action-bar">
            <calcite-action
              active={selectedPanel === "Account"}
              text={"Account"}
              icon="information"
              onClick={actionBarClick}
            ></calcite-action>
            <calcite-action
              active={selectedPanel === "Results"}
              text={"Results"}
              icon="list"
              onClick={actionBarClick}
              disabled={accountResults.length < 2 || parcels.length < 2}
            ></calcite-action>
            <calcite-action
              active={selectedPanel === "Reports"}
              text={"Reports"}
              icon="file-report"
              onClick={actionBarClick}
              disabled={loading}
            ></calcite-action>            
          </calcite-action-bar>
          <div className="panel-container">
            <calcite-panel closed={selectedPanel !== "Account"}>
              {loading && <calcite-scrim loading={loading}></calcite-scrim>}
              <Accounts
                accountsTable={accountsTable.current}
                account={account}
                accounts={accounts}
                parcel={parcel}
                onAccountUpdate={onAccountUpdate}
              ></Accounts>
              <Impervious
                account={account}
                imperviousSurfaces={imperviousSurfaces}
                imperviousTable={imperviousTable.current}
                onImperviousAdd={onImperviousAdd}
              ></Impervious>
              <Apportionments
                account={account}
                apportionments={apportionments}
                apportionmentsTable={apportionmentsTable.current}
                accountsTable={accountsTable.current}
                arcgisMap={arcgisMap.current}
                parcelLayer={parcelLayer.current}
              ></Apportionments>
              <Credits
                account={account}
                credits={credits}
                creditsTable={creditsTable.current}
                onCreditsUpdate={onCreditsUpdate}
              ></Credits>

              <Billing account={account} bill={bill}></Billing>
              <Logs account={account} logs={logs}></Logs>
              <Journals
                account={account}
                journals={journals}
                journalsTable={journalsTable.current}
                onJournalAdd={onJournalAdd}
              ></Journals>
            </calcite-panel>
            {accountsTable.current && (
              <ResultsTable
                accountResults={accountResults}
                accountsTable={accountsTable.current}
                selectedPanel={selectedPanel}
                onAccountUpdate={onAccountUpdate}
              ></ResultsTable>
            )}
            {accountsTable.current && (
              <Reports
                accountsTable={accountsTable.current}
                selectedPanel={selectedPanel}
                onAccountUpdate={onAccountUpdate}
              ></Reports>
            )}
          </div>
        </calcite-shell-panel>
        {/* <calcite-shell-panel
          slot="panel-bottom"
          displayMode="dock"
          open
          layout="horizontal"
          position="end"
          height="l"
          resizable
        >
          {arcgisMap.current && (
            <arcgis-feature-table
              ref={featureTable}
              layers={tableLayers}
              relatedRecordsEnabled
              showLayerDropdown
              referenceElement={arcgisMap.current}
              multipleSelectionDisabled
              actionColumnConfig={actionColumnConfig(arcgisMap.current.view)}
              onarcgisSelectionChange={arcgisSelectionChange}
              onarcgisPropertyChange={arcgisFeatureTableChange}
              hideSelectionColumn={!selectable}
            ></arcgis-feature-table>
          )}
        </calcite-shell-panel> */}
        <arcgis-map
          itemId={
            isTest
              ? "d8309610f598424b9889d62775b6330c"
              : "7be33c08a6704e6fb7f8367b24f4cee6"
          }
          onarcgisViewReadyChange={arcgisViewReady}
          onarcgisViewLayerviewCreate={arcgisLayerViewCreate}
          ref={arcgisMap}
          onarcgisViewHold={arcgisViewHold}
        >
          <arcgis-search
            ref={arcgisSearch}
            referenceElement={arcgisMap.current}
            position="top-left"
            includeDefaultSourcesDisabled
            onarcgisComplete={arcgisSelectResult}
            popupDisabled
            resultGraphicDisabled
            locationDisabled
          ></arcgis-search>
          <arcgis-expand position="top-right">
            <arcgis-layer-list
              position="top-right"
              visibilityAppearance="checkbox"
            ></arcgis-layer-list>
          </arcgis-expand>
          <arcgis-expand position="top-right">
            <arcgis-legend position="top-right"></arcgis-legend>
          </arcgis-expand>
          <arcgis-basemap-toggle
            position="bottom-right"
            nextBasemap={nextBasemap}
          ></arcgis-basemap-toggle>
        </arcgis-map>
      </calcite-shell>
    </>
  );
}

export default App;
