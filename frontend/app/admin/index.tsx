import { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { Button } from "react-native-paper";

// Enhanced Leave Card Component
function LeaveRequestCard({ leave, onApprove, onReject, isUpdating }: any) {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return '#4CAF50';
            case 'rejected': return '#f44336';
            case 'pending': return '#FF9800';
            default: return '#757575';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'checkmark-circle';
            case 'rejected': return 'close-circle';
            case 'pending': return 'time-outline';
            default: return 'help-circle';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDuration = () => {
        if (leave.start_date === leave.end_date) return "1 day";
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} days`;
    };

    return (
        <View style={styles.leaveCard}>
            {/* Header with User Info */}
            <View style={styles.cardHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userInitials}>
                            {leave.full_name ? leave.full_name.charAt(0).toUpperCase() : 
                             leave.email ? leave.email.charAt(0).toUpperCase() : '?'}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>
                            {leave.full_name || 'Unknown User'}
                        </Text>
                        <Text style={styles.userEmail}>{leave.email}</Text>
                        {leave.team_name && (
                            <Text style={styles.teamName}>Team: {leave.team_name}</Text>
                        )}
                    </View>
                </View>
                <View style={styles.statusContainer}>
                    <Ionicons 
                        name={getStatusIcon(leave.status)} 
                        size={20} 
                        color={getStatusColor(leave.status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(leave.status) }]}>
                        {leave.status}
                    </Text>
                </View>
            </View>

            {/* Leave Details */}
            <View style={styles.leaveDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#2196F3" />
                    <Text style={styles.detailLabel}>Leave Type:</Text>
                    <Text style={styles.detailValue}>{leave.leave_type}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#2196F3" />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(leave.start_date)} - {formatDate(leave.end_date)} ({getDuration()})
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#2196F3" />
                    <Text style={styles.detailLabel}>Applied On:</Text>
                    <Text style={styles.detailValue}>
                        {formatDate(leave.created_at)}
                    </Text>
                </View>

                {leave.reason && (
                    <View style={styles.reasonContainer}>
                        <Text style={styles.reasonLabel}>Reason:</Text>
                        <Text style={styles.reasonText}>{leave.reason}</Text>
                    </View>
                )}
            </View>

            {/* Action Buttons for Pending Requests */}
            {leave.status === "Pending" && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]}
                        disabled={isUpdating}
                        onPress={() => onApprove(leave.id)}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Approve</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]}
                        disabled={isUpdating}
                        onPress={() => onReject(leave.id)}
                    >
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="close" size={16} color="#fff" />
                                <Text style={styles.actionButtonText}>Reject</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

export default function AdminDashboard() {
    const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("leaves")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setLeaveRequests(data || []);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaves();
    };

    const getStatusCount = (status: string) => {
        return leaveRequests.filter(
            (leave) => leave.status?.toLowerCase() === status.toLowerCase()
        ).length;
    };

    const updateLeaveStatus = async (id: string, status: string) => {
        try {
            setUpdatingId(id);
            const { error } = await supabase
                .from("leaves")
                .update({ status })
                .eq("id", id);
            if (error) throw error;
            await fetchLeaves();
        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Loading leave requests...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#2196F3']}
                        tintColor="#2196F3"
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>Leave Management System</Text>
                    </View>
                    <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                        <Ionicons name="refresh" size={24} color="#2196F3" />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <SummaryCard 
                        icon="checkmark-circle" 
                        color="#4CAF50" 
                        label="Approved" 
                        count={getStatusCount("Approved")} 
                    />
                    <SummaryCard 
                        icon="time-outline" 
                        color="#FF9800" 
                        label="Pending" 
                        count={getStatusCount("Pending")} 
                    />
                    <SummaryCard 
                        icon="close-circle" 
                        color="#f44336" 
                        label="Rejected" 
                        count={getStatusCount("Rejected")} 
                    />
                </View>

                {/* Leave Requests Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Leave Requests</Text>
                    <Text style={styles.sectionSubtitle}>{leaveRequests.length} total requests</Text>
                </View>

                {/* Leave Requests List */}
                {leaveRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={64} color="#E3F2FD" />
                        <Text style={styles.emptyStateTitle}>No Leave Requests</Text>
                        <Text style={styles.emptyStateSubtitle}>All leave requests will appear here</Text>
                    </View>
                ) : (
                    <View style={styles.leaveList}>
                        {leaveRequests.map((leave) => (
                            <LeaveRequestCard
                                key={leave.id}
                                leave={leave}
                                onApprove={(id: string) => updateLeaveStatus(id, "Approved")}
                                onReject={(id: string) => updateLeaveStatus(id, "Rejected")}
                                isUpdating={updatingId === leave.id}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function SummaryCard({ icon, color, label, count }: { icon: any; color: string; label: string; count: number }) {
    return (
        <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
                <Ionicons name={icon} size={28} color={color} />
            </View>
            <Text style={styles.summaryNumber}>{count}</Text>
            <Text style={styles.summaryLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8f9fa"
    },
    container: {
        flex: 1
    },
    contentContainer: {
        paddingBottom: 30
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#666",
        fontWeight: "500"
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E3F2FD"
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1976D2"
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 2
    },
    refreshButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: "#E3F2FD"
    },
    summaryContainer: {
        flexDirection: "row",
        padding: 20,
        gap: 12
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        elevation: 2,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#E3F2FD"
    },
    summaryIcon: {
        marginBottom: 12
    },
    summaryNumber: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1976D2",
        marginBottom: 4
    },
    summaryLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "600",
        textTransform: "uppercase"
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1976D2",
        marginBottom: 4
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#666"
    },
    leaveList: {
        paddingHorizontal: 20,
        gap: 16
    },
    leaveCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        elevation: 2,
        shadowColor: "#2196F3",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#E3F2FD"
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16
    },
    userInfo: {
        flexDirection: "row",
        flex: 1
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2196F3",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },
    userInitials: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff"
    },
    userDetails: {
        flex: 1
    },
    userName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1976D2",
        marginBottom: 2
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 2
    },
    teamName: {
        fontSize: 12,
        color: "#2196F3",
        fontWeight: "500"
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
        textTransform: "uppercase"
    },
    leaveDetails: {
        marginBottom: 16
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8
    },
    detailLabel: {
        fontSize: 14,
        color: "#666",
        marginLeft: 8,
        marginRight: 8,
        minWidth: 80
    },
    detailValue: {
        fontSize: 14,
        color: "#333",
        fontWeight: "500",
        flex: 1
    },
    reasonContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        borderLeft: 4,
        borderLeftColor: "#2196F3"
    },
    reasonLabel: {
        fontSize: 12,
        color: "#2196F3",
        fontWeight: "600",
        marginBottom: 4,
        textTransform: "uppercase"
    },
    reasonText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6
    },
    approveButton: {
        backgroundColor: "#4CAF50"
    },
    rejectButton: {
        backgroundColor: "#f44336"
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600"
    },
    emptyState: {
        alignItems: "center",
        padding: 60,
        backgroundColor: "#fff",
        margin: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E3F2FD"
    },
    emptyStateTitle: {
        fontSize: 18,
        color: "#1976D2",
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center"
    }
});