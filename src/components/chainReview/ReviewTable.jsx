/**
 * ReviewTable — main data table for admin chain QA review
 * Handles Manufacturer_Equivalents, Chain_Dimensions, Chain_Review_Flags
 */
import { useState } from "react";
import ReviewRowEquivalents from "./ReviewRowEquivalents";
import ReviewRowDimensions  from "./ReviewRowDimensions";
import ReviewRowFlags       from "./ReviewRowFlags";

export default function ReviewTable({ records, entityKey, onApprove, onReject, onFlag, onSaveNotes }) {
  const [expandedId, setExpandedId] = useState(null);

  function toggle(id) { setExpandedId(p => p === id ? null : id); }

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", marginTop: 4 }}>
      {records.map((record, i) => {
        const isExpanded = expandedId === record.id;
        const RowComponent =
          entityKey === "equivalents" ? ReviewRowEquivalents :
          entityKey === "dimensions"  ? ReviewRowDimensions  :
                                        ReviewRowFlags;
        return (
          <div key={record.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            <RowComponent
              record={record}
              expanded={isExpanded}
              onToggle={() => toggle(record.id)}
              onApprove={() => onApprove(record)}
              onReject={() => onReject(record)}
              onFlag={() => onFlag(record)}
              onSaveNotes={(notes) => onSaveNotes(record, notes)}
            />
          </div>
        );
      })}
    </div>
  );
}