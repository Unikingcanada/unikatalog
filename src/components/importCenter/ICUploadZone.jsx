/**
 * ICUploadZone — Drag/drop multi-file uploader
 * Supports JSON, CSV, XLSX
 */
import { useState, useRef, useCallback } from "react";

const ACCEPTED = [".json", ".csv", ".xlsx", ".xls"];
const ACCEPT_MIME = "application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export default function ICUploadZone({ onFilesSelected }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter(f => {
      const ext = f.name.toLowerCase().split('.').pop();
      return ['json','csv','xlsx','xls'].includes(ext);
    });
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          border: `2px dashed ${dragging ? "#F26522" : "#C9C5BB"}`,
          borderRadius: 14,
          background: dragging ? "#FDF0E9" : "#fafafa",
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.18s",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#0E1F3A", marginBottom: 6 }}>
          {dragging ? "Drop files here" : "Drag & drop catalog files"}
        </div>
        <div style={{ fontSize: 12, color: "#3A4A66", marginBottom: 16 }}>
          Supports JSON, CSV, XLSX · Multiple files allowed · Large catalogs supported
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[".json", ".csv", ".xlsx"].map(ext => (
            <span key={ext} style={{
              background: "#D9D6CE", color: "#3A4A66", borderRadius: 6,
              padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "monospace",
            }}>{ext}</span>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          <span style={{
            display: "inline-block", background: "#0E1F3A", color: "#fff",
            padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700,
          }}>Browse Files</span>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_MIME}
        multiple
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}