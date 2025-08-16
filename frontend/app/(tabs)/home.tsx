import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    StatusBar,
    Dimensions
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import TimerWidget from "../../components/TimerWidget";
import AttendanceTypeSwitch from "../../components/AttendanceTypeSwitch";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { formatDate, formatTime } from "../../utils/dateUtils";

const { width } = Dimensions.get('window');

export default function Home() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockIn, setIsClockIn] = useState(true);
    const [attendanceStatus, setAttendanceStatus] = useState<'not_started' | 'working' | 'break' | 'completed'>('not_started');

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate API call
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleClockAction = () => {
        if (isClockIn) {
            router.push("/clock/clock-in");
        } else {
            router.push("/clock/clock-out");
        }
    };

    const getStatusColor = () => {
        switch (attendanceStatus) {
            case 'working': return Colors.light.success;
            case 'break': return Colors.light.warning;
            case 'completed': return Colors.light.gray400;
            default: return Colors.light.primary;
        }
    };

    const getStatusText = () => {
        switch (attendanceStatus) {
            case 'working': return 'Working';
            case 'break': return 'On Break';
            case 'completed': return 'Day Complete';
            default: return 'Not Started';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.userSection}>
                        <View>
                            <Text style={styles.greeting}>Hello, Vedant 👋</Text>
                            <Text style={styles.dateText}>{formatDate(currentTime, 'long')}</Text>
                        </View>
                        <View style={styles.timeContainer}>
                            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
                        </View>
                    </View>

                    {/* Status Indicator */}
                    <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
                        <View style={styles.statusContent}>
                            <Ionicons
                                name={attendanceStatus === 'working' ? 'checkmark-circle' : 'time-outline'}
                                size={20}
                                color={getStatusColor()}
                            />
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {getStatusText()}
                            </Text>
                        </View>
                        {attendanceStatus === 'working' && (
                            <Text style={styles.workingHours}>8h 24m elapsed</Text>
                        )}
                    </View>
                </View>

                {/* Timer Widget Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Today's Activity</Text>
                        <Ionicons name="time-outline" size={20} color={Colors.light.gray400} />
                    </View>
                    <TimerWidget />
                </View>

                {/* Attendance Type Switch Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Attendance Mode</Text>
                        <Ionicons name="people-outline" size={20} color={Colors.light.gray400} />
                    </View>
                    <AttendanceTypeSwitch />
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>8.5</Text>
                        <Text style={styles.statLabel}>Hours Today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>22</Text>
                        <Text style={styles.statLabel}>Days This Month</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>95%</Text>
                        <Text style={styles.statLabel}>Attendance</Text>
                    </View>
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
                                name={isClockIn ? "log-in-outline" : "log-out-outline"}
                                size={20}
                                color={Colors.light.background}
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
                                    name="pause-outline"
                                    size={18}
                                    color={Colors.light.primary}
                                    style={{ marginRight: 6 }}
                                />
                            }
                        />
                        <Button
                            title="View Activity"
                            onPress={() => router.push("/(tabs)/activity")}
                            variant="ghost"
                            size="medium"
                            style={styles.secondaryButton}
                            icon={
                                <Ionicons
                                    name="list-outline"
                                    size={18}
                                    color={Colors.light.primary}
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
    container: {
        flex: 1,
        backgroundColor: Colors.light.gray100,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: Colors.light.background,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    userSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 14,
        color: Colors.light.gray500,
        fontWeight: '500',
    },
    timeContainer: {
        alignItems: 'flex-end',
    },
    currentTime: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    statusCard: {
        backgroundColor: Colors.light.gray100,
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
    },
    statusContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    workingHours: {
        fontSize: 12,
        color: Colors.light.gray500,
        marginTop: 4,
        marginLeft: 28,
    },
    card: {
        backgroundColor: Colors.light.background,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 16,
    },
    statCard: {
        backgroundColor: Colors.light.background,
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.light.gray500,
        textAlign: 'center',
        fontWeight: '500',
    },
    actionSection: {
        marginHorizontal: 20,
        marginTop: 24,
    },
    primaryAction: {
        marginBottom: 12,
    },
    secondaryActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    secondaryButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});