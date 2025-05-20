export const convertToDateString = (value: number) => {
  const date = new Date(value);
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;
  return formattedDate;
};

export const getDomainLabel = (
  table: __esri.FeatureLayer | null,
  fieldName: string,
  value: string
): string => {
  
  if (table) {
    const field = table.getField(fieldName);
    if (field && field?.domain && field?.domain?.type === "coded-value") {

      const cv = (field.domain as __esri.CodedValueDomain).codedValues.find(
        (cv) => cv.code === value
      );
      if (cv) {
        return cv.name;
      }
    }
  }
  return value;
};
