import { FormEvent, useEffect, useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
import Graphic from "@arcgis/core/Graphic";

type CreditAttributes = {
  AccountId: string;
  OnsitePercentage: number;
  UpstreamPercentage: number;
  NpdesPercentage: number;
  ControlledSurface: number;
  ApprovalDate: Date | undefined;
  InceptionDate: Date | undefined;
  ExpirationDate: Date | undefined;
  Comment: string;
};

const useCredits = (
  account: __esri.Graphic | undefined,
  credits: __esri.Graphic[],
  creditsTable: __esri.FeatureLayer | null,
  onCreditsUpdate: (graphics: __esri.Graphic[]) => void
) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [credit, setCredit] = useState<__esri.Graphic>();
  const [attributes, setAttributes] = useState<CreditAttributes>({
    AccountId: account?.getAttribute("AccountId"),
    OnsitePercentage: 0,
    UpstreamPercentage: 0,
    NpdesPercentage: 0,
    ControlledSurface: 0,
    ApprovalDate: undefined,
    InceptionDate: undefined,
    ExpirationDate: undefined,
    Comment: "",
  });
  const editingClicked = () => {
    setEditing(!editing);
  };
  const flowItemBack = () => {
    setEditing(!editing);
  };

  useEffect(() => {
    if (credits.length) {
      setCredit(credits[0]);
    } else {
      setCredit(undefined);
    }
  }, [credits]);

  useEffect(() => {
    if (credit) {
      setAttributes({
        AccountId: credit?.getAttribute("AccountId"),
        OnsitePercentage: credit?.getAttribute("OnsitePercentage"),
        UpstreamPercentage: credit?.getAttribute("UpstreamPercentage"),
        NpdesPercentage: credit?.getAttribute("NpdesPercentage"),
        ControlledSurface: credit?.getAttribute("ControlledSurface"),
        ApprovalDate: new Date(credit?.getAttribute("ApprovalDate")),
        InceptionDate: new Date(credit?.getAttribute("InceptionDate")),
        ExpirationDate: new Date(credit?.getAttribute("ExpirationDate")),
        Comment: credit?.getAttribute("Comment"),
      });
    } else {
      setAttributes({
        AccountId: account?.getAttribute("AccountId"),
        OnsitePercentage: 0,
        UpstreamPercentage: 0,
        NpdesPercentage: 0,
        ControlledSurface: 0,
        ApprovalDate: undefined,
        InceptionDate: undefined,
        ExpirationDate: new Date(2030, 7, 1),
        Comment: "",
      });
    }
  }, [account, credit]);
  const attributeInputNumberChanged = (
    event: TargetedEvent<HTMLCalciteInputNumberElement, undefined>
  ) => {
    let value = parseFloat(event.target.value);
    if (event.target.name === "NpdesPercentage") {
      value = value / 100;
    }
    setAttributes((prevState) => ({
      ...prevState,
      [event.target.name]: value,
    }));
  };
  const attributeInputDateChanged = (
    event: TargetedEvent<HTMLCalciteInputDatePickerElement, undefined>
  ) => {
    const value = event.target.valueAsDate;
    setAttributes((prevState) => ({
      ...prevState,
      [event.target.name]: value,
    }));
  };
  const attributeTextAreaChanged = (
    event: TargetedEvent<HTMLCalciteTextAreaElement, undefined>
  ) => {
    const value = event.target.value;
    setAttributes((prevState) => ({
      ...prevState,
      [event.target.name]: value,
    }));
  };
  const attributeSelectChanged = (
    event: TargetedEvent<HTMLCalciteSelectElement, undefined>
  ): void => {
    setAttributes((prevState) => ({
      ...prevState,
      [event.target.name]: parseFloat(event.target.selectedOption.value),
    }));
  };
  const addOrUpdateCredit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditing(false);
    if (credit) {
      credit.setAttribute("ApprovalDate", attributes.ApprovalDate?.getTime());
      credit.setAttribute("ControlledSurface", attributes.ControlledSurface);
      credit.setAttribute("InceptionDate", attributes.InceptionDate?.getTime());
      credit.setAttribute("NpdesPercentage", attributes.NpdesPercentage);
      credit.setAttribute("OnsitePercentage", attributes.OnsitePercentage);
      credit.setAttribute("UpstreamPercentage", attributes.UpstreamPercentage);
      credit.setAttribute("Comment", attributes.Comment);
      await creditsTable?.applyEdits({ addFeatures: [credit] });
    } else {
      const newCredit = new Graphic({
        attributes: {
          AccountId: attributes.AccountId,
          ControlledSurface: attributes.ControlledSurface,
          NpdesPercentage: attributes.NpdesPercentage,
          OnsitePercentage: attributes.OnsitePercentage,
          UpstreamPercentage: attributes.UpstreamPercentage,
          InceptionDate: attributes.InceptionDate?.getTime(),
          ApprovalDate: attributes.ApprovalDate?.getTime(),
          ExpirationDate: attributes.ExpirationDate?.getTime(),
          Comment: attributes.Comment,
        },
      });
      await creditsTable?.applyEdits({ addFeatures: [newCredit] });
      onCreditsUpdate([newCredit]);
    }
  };

  const deleteCredit = async () => {
    if (credit) {
      await creditsTable?.applyEdits({ deleteFeatures: [credit] });
      onCreditsUpdate([]);
      setEditing(false);
    }
  };
  return {
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
  };
};

export default useCredits;
