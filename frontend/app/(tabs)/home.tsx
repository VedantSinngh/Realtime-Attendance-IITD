import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TimerWidget from "../../components/TimerWidget";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { formatDate, formatTime } from "../../utils/dateUtils";
import { useAuth } from "../../services/AuthContext";
import { supabase, getUserLeaves } from "../../services/supabase";

const { width } = Dimensions.get("window");

// Types for real-time data
interface LeaveRequest {
    id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason: string;
    created_at: string;
}

interface AttendanceRecord {
    id: string;
    clock_in: string;
    clock_out: string | null;
    date: string;
    total_hours: number | null;
    status: 'working' | 'completed' | 'break';
}

interface DashboardStats {
    todayHours: number;
    monthlyAttendance: number;
    attendancePercentage: number;
    pendingLeaves: number;
    rejectedLeaves: number;
}

// Updated AttendanceTypeSwitch component
function AttendanceTypeSwitch() {
    const [activeType, setActiveType] = useState<"individual" | "group">("individual");
    const router = useRouter();

    const handleSwitch = (type: "individual" | "group") => {
        setActiveType(type);
        router.push(`/face-verification/post?type=${type}`);
    };

    return (
        <View style={styles.attendanceSwitchContainer}>
            <TouchableOpacity
                style={[
                    styles.switchButton,
                    activeType === "individual" && styles.switchButtonActive,
                ]}
                onPress={() => handleSwitch("individual")}
            >
                <Text
                    style={[
                        styles.switchButtonText,
                        activeType === "individual" && styles.switchButtonTextActive,
                    ]}
                >
                    Individual
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[
                    styles.switchButton,
                    activeType === "group" && styles.switchButtonActive,
                ]}
                onPress={() => handleSwitch("group")}
            >
                <Text
                    style={[
                        styles.switchButtonText,
                        activeType === "group" && styles.switchButtonTextActive,
                    ]}
                >
                    Group
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export default function Home() {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockIn, setIsClockIn] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<
        "not_started" | "working" | "break" | "completed"
    >("not_started");
    
    // Real-time data states
    const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
        todayHours: 0,
        monthlyAttendance: 0,
        attendancePercentage: 0,
        pendingLeaves: 0,
        rejectedLeaves: 0,
    });
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);

    // Time update effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch today's attendance record
    const fetchTodayAttendance = useCallback(async () => {
        if (!user) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', today)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching attendance:', error);
                return;
            }

            if (data) {
                setTodayAttendance(data);
                setAttendanceStatus(data.status || 'not_started');
                setIsClockIn(!data.clock_in || !!data.clock_out);
            } else {
                setTodayAttendance(null);
                setAttendanceStatus('not_started');
                setIsClockIn(true);
            }
        } catch (error) {
            console.error('Error fetching today attendance:', error);
        }
    }, [user]);

    // Fetch leave requests
    const fetchLeaveRequests = useCallback(async () => {
        if (!user) return;

        try {
            const data = await getUserLeaves();
            setLeaveRequests(data || []);
            
            // Calculate leave stats
            const pendingLeaves = data?.filter(leave => leave.status === 'Pending').length || 0;
            const rejectedLeaves = data?.filter(leave => leave.status === 'Rejected').length || 0;
            
            setDashboardStats(prev => ({
                ...prev,
                pendingLeaves,
                rejectedLeaves,
            }));
        } catch (error) {
            console.error('Error fetching leave requests:', error);
        }
    }, [user]);

    // Fetch attendance statistics
    const fetchAttendanceStats = useCallback(async () => {
        if (!user) return;

        try {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];

            // Fetch monthly attendance records
            const { data: monthlyData, error: monthlyError } = await supabase
                .from('attendance')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startOfMonthStr)
                .lte('date', todayStr);

            if (monthlyError) {
                console.error('Error fetching monthly attendance:', monthlyError);
                return;
            }

            // Calculate stats
            const monthlyAttendance = monthlyData?.length || 0;
            const workingDays = Math.ceil((today.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
            const attendancePercentage = workingDays > 0 ? Math.round((monthlyAttendance / workingDays) * 100) : 0;

            // Calculate today's hours
            const todayRecord = monthlyData?.find(record => record.date === todayStr);
            const todayHours = todayRecord?.total_hours || 0;

            setDashboardStats(prev => ({
                ...prev,
                todayHours: parseFloat(todayHours.toFixed(1)),
                monthlyAttendance,
                attendancePercentage: Math.min(attendancePercentage, 100),
            }));
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
        }
    }, [user]);

    // Initial data fetch
    useEffect(() => {
        if (user) {
            const fetchData = async () => {
                setLoading(true);
                await Promise.all([
                    fetchTodayAttendance(),
                    fetchLeaveRequests(),
                    fetchAttendanceStats(),
                ]);
                setLoading(false);
            };

            fetchData();
        }
    }, [user, fetchTodayAttendance, fetchLeaveRequests, fetchAttendanceStats]);

    // Set up real-time subscriptions
    useEffect(() => {
        if (!user) return;

        const attendanceSubscription = supabase
            .channel('attendance_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'attendance',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Attendance change:', payload);
                    fetchTodayAttendance();
                    fetchAttendanceStats();
                }
            )
            .subscribe();

        const leaveSubscription = supabase
            .channel('leave_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'leaves',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Leave change:', payload);
                    fetchLeaveRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(attendanceSubscription);
            supabase.removeChannel(leaveSubscription);
        };
    }, [user, fetchTodayAttendance, fetchLeaveRequests]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchTodayAttendance(),
            fetchLeaveRequests(),
            fetchAttendanceStats(),
        ]);
        setRefreshing(false);
    }, [fetchTodayAttendance, fetchLeaveRequests, fetchAttendanceStats]);

    const handleClockAction = () => {
        if (isClockIn) {
            router.push("/clock/clock-in");
        } else {
            router.push("/clock/clock-out");
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: signOut }
            ]
        );
    };

    const getStatusColor = () => {
        switch (attendanceStatus) {
            case "working":
                return Colors.light.success || "#28a745";
            case "break":
                return Colors.light.warning || "#ffc107";
            case "completed":
                return Colors.light.gray400 || "#6c757d";
            default:
                return Colors.light.primary || "#007bff";
        }
    };

    const getStatusText = () => {
        switch (attendanceStatus) {
            case "working":
                return "Working";
            case "break":
                return "On Break";
            case "completed":
                return "Day Complete";
            default:
                return "Not Started";
        }
    };

    const getStatusIcon = () => {
        switch (attendanceStatus) {
            case "working":
                return "checkmark-circle";
            case "break":
                return "pause-circle";
            case "completed":
                return "checkmark-done-circle";
            default:
                return "time-outline";
        }
    };

    const formatUsername = (email: string) => {
        if (!email) return "User";
        const username = email.split('@')[0];
        return username.charAt(0).toUpperCase() + username.slice(1);
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const getWorkingHours = () => {
        if (!todayAttendance?.clock_in) return "0h 0m";
        
        const clockIn = new Date(todayAttendance.clock_in);
        const clockOut = todayAttendance.clock_out ? new Date(todayAttendance.clock_out) : new Date();
        const diff = clockOut.getTime() - clockIn.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.light.primary || "#007bff"}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        tintColor="#fff"
                        colors={[Colors.light.primary || "#007bff"]}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.userSection}>
                            <View style={styles.userInfo}>
                                <Text style={styles.greeting}>
                                    {getGreeting()}, {user?.user_metadata?.full_name || formatUsername(user?.email || "") || "User"}!
                                </Text>
                                <Text style={styles.dateText}>
                                    {formatDate(currentTime, "long")}
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.profileButton}
                                onPress={() => router.push("/profile")}
                            >
                                <View style={styles.profileAvatar}>
                                    <Text style={styles.profileInitial}>
                                        {(user?.user_metadata?.full_name || formatUsername(user?.email || "") || "U").charAt(0)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.timeSection}>
                            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
                            <Text style={styles.timeLabel}>Current Time</Text>
                        </View>

                        <View style={[styles.statusCard, { backgroundColor: `${getStatusColor()}15` }]}>
                            <View style={styles.statusContent}>
                                <View style={[styles.statusIcon, { backgroundColor: getStatusColor() }]}>
                                    <Ionicons
                                        name={getStatusIcon()}
                                        size={18}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.statusTextContainer}>
                                    <Text style={styles.statusText}>
                                        {getStatusText()}
                                    </Text>
                                    {attendanceStatus === "working" && (
                                        <Text style={styles.workingHours}>
                                            {getWorkingHours()} elapsed
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Stats - Real-time Data */}
                {/* <View style={styles.quickStatsContainer}>
                    <View style={styles.quickStatCard}>
                        <View style={styles.quickStatIcon}>
                            <Ionicons name="time" size={20} color={Colors.light.primary || "#007bff"} />
                        </View>
                        <Text style={styles.quickStatValue}>{dashboardStats.todayHours}h</Text>
                        <Text style={styles.quickStatLabel}>Today</Text>
                    </View>
                    
                    <View style={styles.quickStatCard}>
                        <View style={styles.quickStatIcon}>
                            <Ionicons name="calendar" size={20} color="#28a745" />
                        </View>
                        <Text style={styles.quickStatValue}>{dashboardStats.monthlyAttendance}</Text>
                        <Text style={styles.quickStatLabel}>This Month</Text>
                    </View>
                    
                    <View style={styles.quickStatCard}>
                        <View style={styles.quickStatIcon}>
                            <Ionicons name="trending-up" size={20} color="#ffc107" />
                        </View>
                        <Text style={styles.quickStatValue}>{dashboardStats.attendancePercentage}%</Text>
                        <Text style={styles.quickStatLabel}>Attendance</Text>
                    </View>
                </View> */}

                {/* Leave Status Cards */}
                {(dashboardStats.pendingLeaves > 0 || dashboardStats.rejectedLeaves > 0) && (
                    <View style={styles.leaveStatusContainer}>
                        {dashboardStats.pendingLeaves > 0 && (
                            <TouchableOpacity 
                                style={[styles.leaveStatusCard, { borderLeftColor: '#ffc107' }]}
                                onPress={() => router.push('/leave/status')}
                            >
                                <View style={styles.leaveStatusContent}>
                                    <Ionicons name="hourglass" size={24} color="#ffc107" />
                                    <View style={styles.leaveStatusText}>
                                        <Text style={styles.leaveStatusTitle}>Pending Approvals</Text>
                                        <Text style={styles.leaveStatusCount}>{dashboardStats.pendingLeaves} request{dashboardStats.pendingLeaves !== 1 ? 's' : ''}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#666" />
                                </View>
                            </TouchableOpacity>
                        )}

                        {dashboardStats.rejectedLeaves > 0 && (
                            <TouchableOpacity 
                                style={[styles.leaveStatusCard, { borderLeftColor: '#dc3545' }]}
                                onPress={() => router.push('/leave/status')}
                            >
                                <View style={styles.leaveStatusContent}>
                                    <Ionicons name="close-circle" size={24} color="#dc3545" />
                                    <View style={styles.leaveStatusText}>
                                        <Text style={styles.leaveStatusTitle}>Rejected Requests</Text>
                                        <Text style={styles.leaveStatusCount}>{dashboardStats.rejectedLeaves} request{dashboardStats.rejectedLeaves !== 1 ? 's' : ''}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color="#666" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Timer Widget */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons
                                name="stopwatch"
                                size={22}
                                color={Colors.light.primary || "#007bff"}
                            />
                            <Text style={styles.cardTitle}>Today's Activity</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.cardAction}
                            onPress={onRefresh}
                        >
                            <Ionicons name="refresh" size={18} color={Colors.light.gray400 || "#6c757d"} />
                        </TouchableOpacity>
                    </View>
                    <TimerWidget />
                </View>

                {/* Attendance Type Switch */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleContainer}>
                            <Ionicons
                                name="people"
                                size={22}
                                color={Colors.light.primary || "#007bff"}
                            />
                            <Text style={styles.cardTitle}>Attendance Mode</Text>
                        </View>
                        <View style={styles.cardBadge}>
                            <Text style={styles.cardBadgeText}>Active</Text>
                        </View>
                    </View>
                    <AttendanceTypeSwitch />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    <Button
                        title={isClockIn ? "Clock In" : "Clock Out"}
                        onPress={handleClockAction}
                        size="large"
                        style={styles.primaryAction}
                        icon={
                            <Ionicons
                                name={isClockIn ? "log-in" : "log-out"}
                                size={22}
                                color="#fff"
                                style={{ marginRight: 8 }}
                            />
                        }
                    />

                    <View style={styles.secondaryActions}>
                        <Button
                            title="Take Break"
                            onPress={() => router.push("/clock/break")}
                            variant="outline"
                            size="medium"
                            style={styles.secondaryButton}
                            icon={
                                <Ionicons
                                    name="pause"
                                    size={18}
                                    color={Colors.light.primary || "#007bff"}
                                    style={{ marginRight: 6 }}
                                />
                            }
                        />
                        <Button
                            title="Apply Leave"
                            onPress={() => router.push("/leave/apply")}
                            variant="ghost"
                            size="medium"
                            style={styles.secondaryButton}
                            icon={
                                <Ionicons
                                    name="calendar"
                                    size={18}
                                    color={Colors.light.primary || "#007bff"}
                                    style={{ marginRight: 6 }}
                                />
                            }
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8f9fa" },
    centered: { justifyContent: "center", alignItems: "center" },
    scrollContent: { paddingBottom: 20 },
    header: {
        backgroundColor: Colors.light.primary || "#007bff",
        paddingTop: 10,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    headerContent: { paddingHorizontal: 20, paddingTop: 10 },
    userSection: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
    userInfo: { flex: 1 },
    greeting: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 6 },
    dateText: { fontSize: 15, color: "rgba(255,255,255,0.8)", fontWeight: "500" },
    profileButton: { marginLeft: 15 },
    profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
    profileInitial: { fontSize: 20, fontWeight: "600", color: "#fff" },
    timeSection: { alignItems: "center", marginBottom: 20 },
    currentTime: { fontSize: 36, fontWeight: "800", color: "#fff", marginBottom: 4 },
    timeLabel: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    statusCard: { borderRadius: 16, padding: 16, marginTop: 8 },
    statusContent: { flexDirection: "row", alignItems: "center" },
    statusIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
    statusTextContainer: { flex: 1 },
    statusText: { fontSize: 16, fontWeight: "600", color: "#fff", marginBottom: 2 },
    workingHours: { fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: "500" },
    quickStatsContainer: { flexDirection: "row", paddingHorizontal: 20, marginTop: -15, marginBottom: 5, gap: 12 },
    quickStatCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    quickStatIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f8f9fa", justifyContent: "center", alignItems: "center", marginBottom: 8 },
    quickStatValue: { fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 4 },
    quickStatLabel: { fontSize: 12, color: "#666", fontWeight: "500" },
    
    // Leave Status Styles
    leaveStatusContainer: { paddingHorizontal: 20, marginTop: 10 },
    leaveStatusCard: { 
        backgroundColor: "#fff", 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 8, 
        borderLeftWidth: 4,
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.05, 
        shadowRadius: 4, 
        elevation: 2 
    },
    leaveStatusContent: { flexDirection: "row", alignItems: "center" },
    leaveStatusText: { flex: 1, marginLeft: 12 },
    leaveStatusTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 },
    leaveStatusCount: { fontSize: 12, color: "#666" },

    card: { backgroundColor: "#fff", marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    cardTitleContainer: { flexDirection: "row", alignItems: "center" },
    cardTitle: { fontSize: 17, fontWeight: "600", color: "#333", marginLeft: 8 },
    cardAction: { padding: 4 },
    cardBadge: { backgroundColor: "#e8f5e8", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    cardBadgeText: { fontSize: 12, color: "#28a745", fontWeight: "500" },
    actionSection: { paddingHorizontal: 20, marginTop: 20 },
    primaryAction: { marginBottom: 12, borderRadius: 16, paddingVertical: 16 },
    secondaryActions: { flexDirection: "row", gap: 12 },
    secondaryButton: { flex: 1, borderRadius: 12 },

    // Attendance Switch Styles
    attendanceSwitchContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
    switchButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.primary || "#007bff", backgroundColor: "#fff", marginHorizontal: 5, alignItems: "center" },
    switchButtonActive: { backgroundColor: Colors.light.primary || "#007bff" },
    switchButtonText: { fontSize: 16, fontWeight: "500", color: Colors.light.primary || "#007bff" },
    switchButtonTextActive: { color: "#fff" },
});