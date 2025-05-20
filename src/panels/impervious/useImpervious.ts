import { useEffect, useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
import Graphic from "@arcgis/core/Graphic";

type ImperviousAttributes = {
    AccountId: string;
    BuildingImpervious: number;
    ParkingImpervious: number;
    RecreationImpervious: number;
    RoadTrailImpervious: number;
    MiscImpervious: number;
    OtherImpervious: number;
    PermittedImpervious: number;
    TotalImpervious: number;
    MethodDate: Date | undefined;
    MethodUsed: string;
    EffectiveDate: Date | undefined;
    Status: string;
  };
  

const useImpervious = (
    account: __esri.Graphic | undefined,
  imperviousSurfaces: __esri.Graphic[],
  onImperviousAdd: (graphic: __esri.Graphic) => void
) => {
  const [editing, setEditing] = useState<boolean>(false);
    const [attributes, setAttributes] = useState<ImperviousAttributes>({
      AccountId: account?.getAttribute("AccountId"),
      BuildingImpervious: 0,
      ParkingImpervious: 0,
      RecreationImpervious: 0,
      RoadTrailImpervious: 0,
      MiscImpervious: 0,
      OtherImpervious: 0,
      PermittedImpervious: 0,
      TotalImpervious: 0,
      MethodUsed: "MANUAL",
      MethodDate: undefined,
      EffectiveDate: undefined,
      Status: "P",
    });
    const editingClicked = () => {
      setEditing(!editing);
    };
    const flowItemBack = () => {
      setEditing(!editing);
    };

    useEffect(() => {
      const currentImpervious = imperviousSurfaces.find(
        (surface) => surface.getAttribute("Status") === "C"
      );
      if (currentImpervious) {
        setAttributes({
          AccountId: account?.getAttribute("AccountId"),
          BuildingImpervious:
            currentImpervious.getAttribute("BuildingImpervious"),
          ParkingImpervious: currentImpervious.getAttribute("ParkingImpervious"),
          RecreationImpervious: currentImpervious.getAttribute(
            "RecreationImpervious"
          ),
          RoadTrailImpervious: currentImpervious.getAttribute(
            "RoadTrailImpervious"
          ),
          MiscImpervious: currentImpervious.getAttribute("MiscImpervious"),
          OtherImpervious: currentImpervious.getAttribute("OtherImpervious"),
          PermittedImpervious: currentImpervious.getAttribute(
            "PermittedImpervious"
          ),
          TotalImpervious: currentImpervious.getAttribute("TotalImpervious"),
          MethodDate: new Date(currentImpervious.getAttribute("MethodDate")),
          EffectiveDate: new Date(
            currentImpervious.getAttribute("EffectiveDate")
          ),
          Status: "P",
          MethodUsed: "MANUAL",
        });
      }
    }, [account, imperviousSurfaces]);
  

  
    const attributeInputChanged = (
      event: TargetedEvent<HTMLCalciteInputNumberElement, undefined>
    ) => {
      setAttributes((prevState) => ({
        ...prevState,
        [event.target.label]: parseInt(event.target.value),
      }));
    };
  
    const addImperviousSurface = () => {
      setEditing(false);
      setAttributes((prevState) => ({
        ...prevState,
        TotalImpervious:
          prevState.BuildingImpervious +
          prevState.MiscImpervious +
          prevState.OtherImpervious +
          prevState.ParkingImpervious +
          prevState.RecreationImpervious +
          prevState.RoadTrailImpervious,
      }));
      onImperviousAdd(new Graphic({ attributes: attributes }));
    };
  return {
    editing,
    editingClicked,
    flowItemBack,
    attributes,
    attributeInputChanged,
    addImperviousSurface
  };
};

export default useImpervious;
