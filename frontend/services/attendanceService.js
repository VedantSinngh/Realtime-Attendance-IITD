import { supabase } from "./supabase";

export async function clockIn(userId) {
    const today = new Date().toISOString().split("T")[0];

    // Check if record exists for today
    const { data, error } = await supabase
        .from("clocking_time")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error("Error fetching record:", error);
        return { error };
    }

    if (!data) {
        // New record
        const { data: newRecord, error: insertError } = await supabase
            .from("clocking_time")
            .insert([
                {
                    user_id: userId,
                    date: today,
                    clock_in: new Date().toISOString(),
                    total_seconds: 0,
                },
            ])
            .select()
            .single();
        return { data: newRecord, error: insertError };
    } else {
        // Update existing record with new clock-in
        const { data: updated, error: updateError } = await supabase
            .from("clocking_time")
            .update({
                clock_in: new Date().toISOString(),
            })
            .eq("id", data.id)
            .select()
            .single();
        return { data: updated, error: updateError };
    }
}

export async function clockOut(userId) {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("clocking_time")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

    if (error || !data) {
        return { error: error || "No active record found" };
    }

    const clockInTime = new Date(data.clock_in);
    const now = new Date();
    const elapsedSeconds = Math.floor((now - clockInTime) / 1000);

    const newTotal = (data.total_seconds || 0) + elapsedSeconds;

    const { data: updated, error: updateError } = await supabase
        .from("clocking_time")
        .update({
            clock_out: now.toISOString(),
            total_seconds: newTotal,
        })
        .eq("id", data.id)
        .select()
        .single();

    return { data: updated, error: updateError };
}
