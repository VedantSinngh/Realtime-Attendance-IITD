import { useState } from "react";

export default function useAttendance() {
    const [records, setRecords] = useState<any[]>([]);
    function clockIn() { setRecords((r) => [...r, { type: "in", time: new Date().toISOString() }]); }
    function clockOut() { setRecords((r) => [...r, { type: "out", time: new Date().toISOString() }]); }
    return { records, clockIn, clockOut };
}
