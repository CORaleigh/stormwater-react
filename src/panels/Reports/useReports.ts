import { useEffect, useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
const useReports = (
    accountsTable: __esri.FeatureLayer,
    onAccountUpdate: (account: __esri.Graphic) => void
) => {
    const [reportResults, setReportResults] = useState<__esri.Graphic[]>([]);
    const [selectedReport, setSelectedReport] = useState<string>('pending');
    const reportSelected = (event: TargetedEvent<HTMLCalciteSelectElement, undefined>) => {
        setSelectedReport(event.target.selectedOption.value);
    }
    const resultSelected = (event: TargetedEvent<HTMLCalciteTableElement, undefined>) => {
        const oid = event.target.selectedItems[0].dataset["oid"];
        if (oid) {
          const account = reportResults.find(
            (account) => account.getAttribute("OBJECTID") === parseInt(oid)
          );
          if (account) {
            onAccountUpdate(account);
          }
        }
    }    
    const queryReport = async (where: string) => {
        const results = await accountsTable.queryFeatures({where: where, outFields: ['*']});
        if (results?.features.length) {
            const oids = results.features.map(feature => feature.getAttribute('OBJECTID'));
            const relationship = accountsTable.relationships?.find(relationship => relationship.name === 'Property');
            const parcelResults = await accountsTable.queryRelatedFeatures({relationshipId: relationship?.id, objectIds:oids, outFields: ['OBJECTID', 'SiteAddress']});
            results.features.forEach(feature => {
                const oid = feature.getAttribute('OBJECTID');
                if (parcelResults[oid]) {
                    feature.setAttribute('SiteAddress', parcelResults[oid].features[0].getAttribute('SiteAddress'));
                }
            });
            console.log(relationship)
            return results.features;
            
        } else {
            return [];
        }
    }

    useEffect(() => {
        if (accountsTable) {
            let where: string;
            if (selectedReport === 'pending') {
                where = `Status = 'P'`;
            } 
            if (selectedReport === 'onhold') {
                where = `Status = 'H'`;
            }

            const getReport = (async () => {
               setReportResults(await queryReport(where))
            })
            getReport();
            
        }

    }, [accountsTable, selectedReport]);
    return {
        reportResults, reportSelected,resultSelected
    };
  };



export default useReports;
