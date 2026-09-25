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
        className="flex min-h-11 w-full items-center justify-between rounded-lg border border-fbs-border bg-fbs-dark px-3 py-2.5 text-left text-sm">
        <span className={`min-w-0 truncate ${selected ? "text-white" : "text-gray-600"}`}>
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
            className="w-full min-h-11 border-b border-fbs-border bg-fbs-dark px-3 py-2 text-xs text-white"
          />

          <div className="max-h-48 overflow-y-auto">
            {filtered.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  onChange(b.id);
                  setOpen(false);
                }}
                className="min-h-11 w-full px-4 py-2 text-left text-sm text-white hover:bg-fbs-dark">
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

  const [_loading, setLoading] = useState(true);
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
      <div className="mx-auto min-w-0 max-w-xl">
        <div className="space-y-4 rounded-2xl border border-fbs-border bg-fbs-card p-4 md:p-5">
          {/* GLOBAL CHECKBOX */}
          <label className="flex min-h-11 items-center gap-3">
            <input
              type="checkbox"
              checked={isGlobal}
              onChange={(e) => setIsGlobal(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-fbs-green"
            />
            <span className="text-sm text-gray-400">
              Apply to all batches (Global Holiday)
            </span>
          </label>

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
              className="w-full min-h-11 rounded-lg border border-fbs-border bg-fbs-dark px-3 py-2 text-white"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-xs text-fbs-green">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-fbs-border bg-fbs-dark px-3 py-2 text-white"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="min-h-11 w-full rounded-lg bg-fbs-green py-2 font-semibold text-black">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
