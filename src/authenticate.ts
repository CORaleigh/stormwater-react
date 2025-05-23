import config from "@arcgis/core/config";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import esriId from "@arcgis/core/identity/IdentityManager";
import Portal from "@arcgis/core/portal/Portal"
const info = new OAuthInfo({
  appId: "xWoMZTo6ZiZVTwcT",
  portalUrl: "https://maps.raleighnc.gov/portal",
  popup: false,
});
export const authenticate = async (
  isTest: boolean
): Promise<__esri.PortalUser | nullish> => {
  console.log('is test', isTest)
  if (isTest) {
    info.appId = "u8kxa1iiA6kg2Nhc";
    info.portalUrl = "https://mapstest.raleighnc.gov/portal";
  }
  console.log(info);
  config.portalUrl = info.portalUrl;

  esriId.registerOAuthInfos([info]);
  return await checkSignIn();
};

const checkSignIn = async (): Promise<__esri.PortalUser | nullish> => {
  await esriId.checkSignInStatus(info.portalUrl + "/sharing");
  const portal = new Portal({
    authMode: "immediate",
    url: info.portalUrl
  });
  const creds = await esriId.getCredential(portal.url);
  const result = await portal.queryUsers({ query: creds.userId });
  if (result.results.length) {
    return result.results[0];
  }
};
