import { 
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    SafeAreaView,
    RefreshControl
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import LeaveInfoCard from "./LeaveInfoCard";

export default function LeaveStatusScreen() {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    // Sample leave data - replace with actual data from your API
    const leaveRequests = [
        {
            id: 1,
            appliedOn: "01-08-2025",
            appliedFor: "05-08-2025",
            type: "Sick Leave",
            status: "Approved",
            duration: "1 day",
            description: "Medical appointment"
        },
        {
            id: 2,
            appliedOn: "15-07-2025",
            appliedFor: "20-07-2025 - 22-07-2025",
            type: "Casual Leave",
            status: "Pending",
            duration: "3 days",
            description: "Personal work"
        },
        {
            id: 3,
            appliedOn: "10-07-2025",
            appliedFor: "12-07-2025",
            type: "Work from Home",
            status: "Rejected",
            duration: "1 day",
            description: "Family emergency"
        }
    ];

    const getStatusCount = (status) => {
        return leaveRequests.filter(leave => leave.status.toLowerCase() === status.toLowerCase()).length;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Leave Status</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={22} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Status Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                        </View>
                        <Text style={styles.summaryNumber}>{getStatusCount('Approved')}</Text>
                        <Text style={styles.summaryLabel}>Approved</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="time-outline" size={24} color="#ffc107" />
                        </View>
                        <Text style={styles.summaryNumber}>{getStatusCount('Pending')}</Text>
                        <Text style={styles.summaryLabel}>Pending</Text>
                    </View>

                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="close-circle" size={24} color="#dc3545" />
                        </View>
                        <Text style={styles.summaryNumber}>{getStatusCount('Rejected')}</Text>
                        <Text style={styles.summaryLabel}>Rejected</Text>
                    </View>
                </View>

                {/* Leave Requests Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Leave Requests</Text>
                    <Text style={styles.sectionSubtitle}>
                        {leaveRequests.length} total request{leaveRequests.length !== 1 ? 's' : ''}
                    </Text>
                </View>

                {/* Leave Request Cards */}
                <View style={styles.leaveCardsContainer}>
                    {leaveRequests.map((leave) => (
                        <LeaveInfoCard
                            key={leave.id}
                            appliedOn={leave.appliedOn}
                            appliedFor={leave.appliedFor}
                            type={leave.type}
                            status={leave.status}
                            duration={leave.duration}
                            description={leave.description}
                        />
                    ))}
                </View>

                {/* Empty State (if no leaves) */}
                {leaveRequests.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyStateTitle}>No Leave Requests</Text>
                        <Text style={styles.emptyStateText}>
                            You haven't applied for any leaves yet. Start by creating a new leave request.
                        </Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={() => router.push("/profile/apply-leave")}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add-circle" size={20} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.primaryButtonText}>Apply New Leave</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={() => { /* Handle edit functionality */ }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={20} color="#007bff" style={styles.buttonIcon} />
                        <Text style={styles.secondaryButtonText}>Edit Recent Leave</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                    
                    <TouchableOpacity style={styles.quickActionItem}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.quickActionText}>View Leave Balance</Text>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionItem}>
                        <Ionicons name="download-outline" size={20} color="#666" />
                        <Text style={styles.quickActionText}>Download Leave Report</Text>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickActionItem}>
                        <Ionicons name="settings-outline" size={20} color="#666" />
                        <Text style={styles.quickActionText}>Leave Preferences</Text>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    backButton: {
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    refreshButton: {
        padding: 5,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryIconContainer: {
        marginBottom: 8,
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    leaveCardsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
    actionContainer: {
        paddingHorizontal: 20,
        paddingTop: 25,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#007bff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007bff',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#007bff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    buttonIcon: {
        marginRight: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#007bff',
        fontSize: 16,
        fontWeight: '600',
    },
    quickActionsContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    quickActionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    quickActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    quickActionText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
});