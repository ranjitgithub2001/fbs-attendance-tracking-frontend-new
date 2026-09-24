import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import DashboardLayout from "../../components/DashboardLayout";

// reuse same batch dropdown pattern
import { useRef } from "react";

// ── Batch Select (copied & reused pattern from MarkAttendance) ──
function SearchableBatchSelect({ batches, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selected = batches.find((b) => String(b.id) === String(value));
  const filtered = batches.filter((b) =>
    b.batchName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2.5 text-sm text-left flex justify-between">
        <span className={selected ? "text-white" : "text-gray-600"}>
          {selected ? selected.batchName : "Select batch"}
        </span>
        <span>⌄</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-fbs-card border border-fbs-border rounded-xl shadow-xl">
          <input
            autoFocus
            placeholder="Search batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 bg-fbs-dark text-white text-xs border-b border-fbs-border"
          />

          <div className="max-h-48 overflow-y-auto">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onChange(b.id);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-fbs-dark text-white">
                {b.batchName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerHolidayRequest() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isGlobal, setIsGlobal] = useState(false);

  // fetch trainer batches (same as MarkAttendance)
  useEffect(() => {
    axiosInstance
      .get("/batches/accessible")
      .then((res) => setBatches(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit() {
    if (!batchId || !date || !reason) {
      alert("Fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post(
        `/trainer-requests/holiday?batchId=${batchId}&date=${date}&reason=${reason}`,
      );

      alert("Request sent successfully");
      setBatchId("");
      setDate("");
      setReason("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      pageTitle="Request Holiday"
      pageSubtitle="Submit holiday request for your batch">
      <div className="max-w-xl mx-auto">
        <div className="bg-fbs-card border border-fbs-border rounded-2xl p-5 space-y-4">
          {/* GLOBAL CHECKBOX */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="accent-fbs-green"
            />
            <span className="text-sm text-gray-400">
              Apply to all batches (Global Holiday)
            </span>
          </div>

          {/* Batch (ONLY if not global) */}
          {!isGlobal && (
            <div>
              <label className="text-xs text-fbs-green mb-2 block">Batch</label>
              <SearchableBatchSelect
                batches={batches}
                value={batchId}
                onChange={setBatchId}
              />
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs text-fbs-green mb-2 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs text-fbs-green mb-2 block">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-fbs-dark border border-fbs-border rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-fbs-green text-black py-2 rounded-lg font-semibold">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
