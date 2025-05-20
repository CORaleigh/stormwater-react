import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-table";
import "@esri/calcite-components/components/calcite-table-header";
import "@esri/calcite-components/components/calcite-table-cell";
import "@esri/calcite-components/components/calcite-table-row";
import { BillDetails } from "./getBilling";
interface Props {
  account: __esri.Graphic | undefined;
  bill: BillDetails | undefined;
}

const Billing: React.FC<Props> = ({ account, bill }) => {
  return (
    <calcite-block heading="Billing" collapsible open>
      {!account && <div>No account selected</div>}
      {account && !bill && <div>No billing details </div>}
      {account && bill && (
        <>
          <div className="grid-container">
            <div className="grid-item">
              <div className="heading">Account ID</div>
              <div>{bill.accountId} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Premise ID</div>
              <div>{bill.premiseId} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Bill Address</div>
              <div>{bill.address} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Customer</div>
              <div>{bill.entityName} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Bill ID</div>
              <div>{bill.billId} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Bill Date</div>
              <div>{bill.billDate} </div>
            </div>
            <div className="grid-item">
              <div className="heading">Bill Amount</div>
              <div>${bill.billAmount} </div>
            </div>
            <div className="grid-item">
              <div className="heading">CSA ID</div>
              <div>{bill.csaId} </div>
            </div>
            <div className="grid-item">
              <div className="heading"></div>
              <div></div>
            </div>
          </div>
          <h3>Services</h3>
          <calcite-table caption={"Services"} striped bordered>
            <calcite-table-row slot="table-header">
              <calcite-table-header heading="ID"></calcite-table-header>
              <calcite-table-header heading="Type"></calcite-table-header>
              <calcite-table-header heading="Status"></calcite-table-header>
              <calcite-table-header heading="Source"></calcite-table-header>
              <calcite-table-header heading="Installed"></calcite-table-header>
            </calcite-table-row>
            {bill.servicePoints.map((sp) => (
              <calcite-table-row key={sp.servicePointId}>
                <calcite-table-cell>{sp.servicePointId}</calcite-table-cell>
                <calcite-table-cell>{sp.spTypeCd}</calcite-table-cell>
                <calcite-table-cell>{sp.spStatusFlag}</calcite-table-cell>
                <calcite-table-cell>{sp.spSourceStatusFlag}</calcite-table-cell>
                <calcite-table-cell>{sp.installDate}</calcite-table-cell>
              </calcite-table-row>
            ))}
          </calcite-table>
        </>
      )}
    </calcite-block>
  );
};

export default Billing;
