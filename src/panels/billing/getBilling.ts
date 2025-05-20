export type BillDetails = {
  accountId: string;
  premiseId: string;
  address: string;
  entityName: string;
  billId: string;
  billDate: string;
  billAmount: string;
  csaId: string;
  servicePoints: ServicePoint[];
};
type PremiseAccount = {
  premiseId: string;
  address: string;
  accountId: string;
  serviceAgreementId: string;
  saTypeCd: string;
  saStatusFlag: string;
  entityName: string;
  csaId: string;
};

type LastBill = {
  accountId: string;
  billId: string;
  completionDt: string;
  currentAmt: string;
  totalAmt: string;
  saTypeCd: string;
};

type ServicePoint = {
  premiseId: string;
  servicePointId: string;
  spTypeCd: string;
  spStatusFlag: string;
  spSourceStatusFlag: string;
  installDate: string;
};


const convertDateFormat = (dateStr: string) => {
  const [month, day, year] = dateStr.split("-");
  return `${parseInt(month)}/${parseInt(day)}/${year}`;
}
async function getToken() {
  // const url = import.meta.env.VITE_OAUTH_CLIENT_TOKEN_URL;
  // const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  // const secret = import.meta.env.VITE_OAUTH_CLIENT_SECRET;  
  // const scope = import.meta.env.VITE_OAUTH_CLIENT_SCOPE;  

  try {
    // const response = await fetch(
    //   url,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Basic ${btoa(`${clientId}:${secret}`)}`,
    //       "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    //     },
    //     body: `grant_type=client_credentials&scope=${scope}`,
    //     redirect: "follow"
    //   }
    // );
    const response = await fetch('https://gis.raleighnc.gov/stormwater-ccb-api/auth/token', {method: 'POST'});
    if (!response.ok) {
      throw new Error('Request failed with status: ' + response.status);
    } 
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getPremiseAccounts(premiseId: string, token: string) {
    const response = await fetch(
      `/customers/stormwaterPremAccounts/details?premiseId=${premiseId}&serviceType=ST`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, 
        }
      }
    );
    const data = await response.json();
    return data.rowCount > 0 ? data.results : [];
}

async function getLastBillByAccount(accountId: string, token: string) {
  const response = await fetch(
    `/customers/stormwaterLastAccountBill/details?accountId=${accountId}&serviceType=ST`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, 
      }
    }
  );
  const data = await response.json();
  return data.rowCount > 0 ? data.results : [];
}

async function getPremiseSps(premiseId: string, token: string) {
  const response = await fetch(
    `/customers/stormwaterPremSPs/${premiseId}/details`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, 
      }
    }
  );
  const data = await response.json();
  return data.rowCount > 0 ? data.results : [];
}
// const getPremiseAccounts = async (premiseId: string) => {

//   try {
//     const accessToken = await getToken();
//     const raw = `{"premiseId": "${premiseId}"}`;

//     const response = await fetch('https://us-ashburn-1.stg.utilities-cloud.oracleindustry.com:443/c84r3h/test/ccb/rest/apis/cm/customers/stormwaterPremInfo/details', {
//       method: "GET",
//       headers: {
//           "Authorization": `Bearer ${accessToken}`,
//           "Content-Type": "application/json"
//       },
//       body: raw
//   });

//     const results = (await response.json()) as PremiseAccount[];
//     return results;
//   } catch (error) {
//     console.error("Error fetching premise accounts:", error);
//   }
// };


// const getLastBillByAccount = async (accountId: string) => {
//   const raw = `{"CM-GetLastBillByAccount":{"accountId": "${accountId}", "serviceType": "ST"}}`;
//   const requestOptions = {
//     method: "POST",
//     body: raw,
//     headers: headers,
//     redirect: "follow",
//   } as RequestInit;
//   try {
//     const response = await fetch(
//       "https://cityconnect.raleighnc.gov/RaleighAPI/ccb/getLastBillByAccount",
//       requestOptions
//     );
//     const results = (await response.json()) as LastBill[];
//     return results;
//   } catch (error) {
//     console.error("Error fetching premise accounts:", error);
//     return [];
//   }
// };



// const getPremiseSps = async (premiseId: string) => {
//   const raw = `{"CM-GetPremiseSPs":{"premiseId": "${premiseId}"}}`;
//   const requestOptions = {
//     method: "POST",
//     body: raw,
//     headers: headers,
//     redirect: "follow",
//   } as RequestInit;
//   try {
//     const response = await fetch(
//       "https://cityconnect.raleighnc.gov/RaleighAPI/ccb/getPremiseSPs",
//       requestOptions
//     );
//     const results = (await response.json()) as ServicePoint[];
//     return results;
//   } catch (error) {
//     console.error("Error fetching premise accounts:", error);
//     return [];
//   }
// };

export const getBilling = async (premiseId: string) => {
  const token: string = await getToken();
  if (!token) {
    console.error("Failed to get token");
    return null;
  }
  const premiseAccounts = await getPremiseAccounts(premiseId, token);
  if (premiseAccounts) {
    const premiseAccount = premiseAccounts[0] as PremiseAccount;

    if (premiseAccounts.length) {
      const billDetails: BillDetails = {
        accountId: premiseAccount.accountId,
        premiseId: premiseAccount.premiseId,
        address: premiseAccount.address,
        entityName: premiseAccount.entityName,
        csaId: premiseAccount.csaId,
        servicePoints: [],
        billId: 'N/A',
        billDate: 'N/A',
        billAmount: '0',
      };      
      const lastBills = await getLastBillByAccount(premiseAccount.accountId, token);

      if (lastBills.length) {
        const lastBill = lastBills[0] as LastBill;
        billDetails.billId = lastBill.billId;
        billDetails.billDate = convertDateFormat(lastBill.completionDt);
        billDetails.billAmount = lastBill.currentAmt;
      }
      const premiseSps = await getPremiseSps(premiseAccount.premiseId, token);
      premiseSps.forEach((sp: ServicePoint) => {
        sp.installDate = convertDateFormat(sp.installDate);
      });
      billDetails.servicePoints = premiseSps;
      return billDetails;      
    }
  }
};
