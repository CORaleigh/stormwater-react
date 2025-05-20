import { useState } from "react";
import { TargetedEvent } from "@esri/calcite-components";
import Graphic from "@arcgis/core/Graphic";
const useJournal = (
  account: __esri.Graphic | undefined,
  journalsTable: __esri.FeatureLayer | null,
  onJournalAdd: (graphic: __esri.Graphic) => void
) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [entry, setEntry] = useState<string>("");
  const editingClicked = () => {
    setEditing(!editing);
  };
  const flowItemBack = () => {
    setEditing(!editing);
  };
  const entryChanged = (
    event: TargetedEvent<HTMLCalciteTextAreaElement, undefined>
  ) => {
    setEntry(event.target.value);
  };

  const addJournalEntry = async () => {
    setEditing(false);
    if (account) {
      const graphic = new Graphic({
        attributes: {
          AccountId: account?.getAttribute("AccountId"),
          JournalEntry: entry,
        },
      });
      const result = await journalsTable?.applyEdits({
        addFeatures: [graphic],
      });
      if (result?.addFeatureResults.length) {
        if (result.addFeatureResults[0].objectId) {
          const newResults = await journalsTable?.queryFeatures({
            objectIds: [result.addFeatureResults[0].objectId],
            outFields: ["created_date", "created_user"],
          });
          if (newResults?.features.length) {
            graphic.setAttribute(
              "created_date",
              newResults?.features[0].getAttribute("created_date")
            );
            graphic.setAttribute(
              "created_user",
              newResults?.features[0].getAttribute("created_user")
            );
          }
          onJournalAdd(graphic);
        }
      }
    }
  };
  return {
    editing,
    editingClicked,
    flowItemBack,
    entryChanged,
    addJournalEntry
  };
};

export default useJournal;
