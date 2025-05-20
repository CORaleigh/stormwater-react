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

import "@esri/calcite-components/components/calcite-input";
import "@esri/calcite-components/components/calcite-notice";

import { getDomainLabel } from "../../utils";
import useAccounts from "./useAccounts";

interface Props {
  account: __esri.Graphic | undefined;
  accounts: __esri.Graphic[];
  parcel: __esri.Graphic | undefined;
  accountsTable: __esri.FeatureLayer | null;
  onAccountUpdate: (account: __esri.Graphic) => void;
}

const Accounts: React.FC<Props> = ({
  account,
  accounts,
  parcel,
  accountsTable,
  onAccountUpdate,
}) => {
  const {
    editing,
    editingClicked,
    flowItemBack,
    updateAccount,
    selectedAccountChange,
    editInputChanged,
    editSelectChanged,
    csaId,
    premiseId,
  } = useAccounts(account, accounts, accountsTable, onAccountUpdate);
  return (
    <calcite-block heading="Accounts" collapsible open>
      <calcite-action
        slot="actions-end"
        icon="share"
        text={"Send to CCB"}
        kind="outline"
        disabled={!account}
      ></calcite-action>
      <calcite-action
        slot="actions-end"
        icon="pencil"
        text={"Update"}
        kind="outline"
        onClick={editingClicked}
        active={editing}
        disabled={!account}
      ></calcite-action>
      <div className="block-container">
        {accounts.length > 1 && (
          <calcite-label>
            <calcite-select
              label="Select account"
              oncalciteSelectChange={selectedAccountChange}
            >
              {accounts.map((account) => (
                <calcite-option
                  key={account.getAttribute("OBJECTID")}
                  value={account.getAttribute("OBJECTID")}
                >
                  {`${account.getAttribute("AccountId")} ( ${getDomainLabel(
                    accountsTable,
                    "Status",
                    account.getAttribute("Status")
                  )})`}
                </calcite-option>
              ))}
            </calcite-select>
          </calcite-label>
        )}
        {account && !parcel && (
          <calcite-notice open>
            <div slot="title">Retired Parcel</div>
            <div slot="message">
              Account tied to a retired parcel with REID {account.getAttribute("RealEstateId")}
            </div>
          </calcite-notice>
        )}
        {account && accountsTable && (
          <>
            <calcite-flow>
              <calcite-flow-item selected={!editing}>
                <div className="grid-container">
                  <div className="grid-item">
                    <div className="heading">Account ID</div>
                    <div>{account?.getAttribute("AccountId")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">CSA ID</div>
                    <div>{account?.getAttribute("CsaId")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Premise ID</div>
                    <div>{account?.getAttribute("PremiseId")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Status</div>
                    <div>
                      {getDomainLabel(
                        accountsTable,
                        "Status",
                        account.getAttribute("Status")
                      )}
                    </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">SFEU</div>
                    <div>{account?.getAttribute("Sfeu")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Use Class</div>
                    <div>
                      {getDomainLabel(
                        accountsTable,
                        "UseClass",
                        account.getAttribute("UseClass")
                      )}
                    </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Billing Tier</div>
                    <div>{account?.getAttribute("BillingTier")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Site Address</div>
                    <div>{parcel?.getAttribute("SiteAddress")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Owner</div>
                    <div>{parcel?.getAttribute("Owner")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Real Estate ID</div>
                    <div>{parcel?.getAttribute("RealEstateId")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">PIN #</div>
                    <div>{parcel?.getAttribute("PinNumber")} </div>
                  </div>
                  <div className="grid-item">
                    <div className="heading">Acreage</div>
                    <div>{parcel?.getAttribute("DeedAcres")} </div>
                  </div>
                </div>
              </calcite-flow-item>
              <calcite-flow-item
                selected={editing}
                heading="Edit Account"
                oncalciteFlowItemBack={flowItemBack}
              >
                <form onSubmit={updateAccount} method="POST">
                  <calcite-label>
                    Status
                    <calcite-select
                      label={"Status"}
                      name={"Status"}
                      oncalciteSelectChange={editSelectChanged}
                    >
                      {(
                        accountsTable.getFieldDomain(
                          "Status"
                        ) as __esri.CodedValueDomain
                      )?.codedValues.map((cv) => (
                        <calcite-option
                          key={cv.code}
                          value={cv.code}
                          selected={cv.code === account.getAttribute("Status")}
                        >
                          {cv.name}
                        </calcite-option>
                      ))}
                    </calcite-select>
                  </calcite-label>
                  <calcite-label>
                    Use Class
                    <calcite-select
                      label={"UseClass"}
                      name={"UseClass"}
                      oncalciteSelectChange={editSelectChanged}
                    >
                      {(
                        accountsTable.getFieldDomain(
                          "UseClass"
                        ) as __esri.CodedValueDomain
                      )?.codedValues.map((cv) => (
                        <calcite-option
                          key={cv.code}
                          value={cv.code}
                          selected={
                            cv.code === account.getAttribute("UseClass")
                          }
                        >
                          {cv.name}
                        </calcite-option>
                      ))}
                    </calcite-select>
                  </calcite-label>
                  <calcite-label>
                    Premise ID
                    <calcite-input
                      label={"Premise ID"}
                      name={"PremiseId"}
                      value={premiseId}
                      oncalciteInputChange={editInputChanged}
                      pattern="^(?:\d{10})?$"
                    ></calcite-input>
                  </calcite-label>
                  <calcite-label>
                    CSA ID
                    <calcite-input
                      label={"CSA ID"}
                      name={"CSA ID"}
                      value={csaId}
                      oncalciteInputChange={editInputChanged}
                      pattern="^(?:\d{7})?$"
                    ></calcite-input>
                  </calcite-label>
                  <calcite-button width="full" type="submit" kind="brand">
                    Update Account
                  </calcite-button>
                </form>
              </calcite-flow-item>
            </calcite-flow>
          </>
        )}
        {!account && <div>No account selected</div>}
      </div>
    </calcite-block>
  );
};

export default Accounts;
