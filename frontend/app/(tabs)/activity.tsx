import React, { useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Enhanced Activity Item Component
const ActivityItem = ({ item, onPress }) => {
    const getCategoryColor = (category) => {
        const colors = {
            "Clock In": "#4CAF50",
            "Clock Out": "#FF5722",
            "Break": "#FF9800",
            "Meeting": "#2196F3",
            "Travel": "#9C27B0",
            "Task": "#607D8B",
        };
        return colors[category] || "#757575";
    };

    const getCategoryIcon = (category) => {
        const icons = {
            "Clock In": "log-in-outline",
            "Clock Out": "log-out-outline",
            "Break": "cafe-outline",
            "Meeting": "people-outline",
            "Travel": "car-outline",
            "Task": "checkmark-circle-outline",
        };
        return icons[category] || "ellipse-outline";
    };

    return (
        <TouchableOpacity style={styles.activityItem} onPress={() => onPress(item)}>
            <View style={styles.activityHeader}>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>{item.time}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>
                <View
                    style={[
                        styles.categoryBadge,
                        { backgroundColor: getCategoryColor(item.category) },
                    ]}
                >
                    <Ionicons
                        name={getCategoryIcon(item.category)}
                        size={16}
                        color="white"
                    />
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            </View>

            <View style={styles.activityBody}>
                <Text style={styles.infoText}>{item.info}</Text>
                <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.locationText}>{item.location}</Text>
                </View>
            </View>

            {item.notes && (
                <Text style={styles.notesText} numberOfLines={2}>
                    {item.notes}
                </Text>
            )}
        </TouchableOpacity>
    );
};

// Date Picker Component
const DatePicker = ({ selectedDate, onDateChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const dates = [
        "Today",
        "Yesterday",
        "2 days ago",
        "3 days ago",
        "1 week ago",
        "2 weeks ago",
        "1 month ago",
    ];

    return (
        <View style={styles.datePickerContainer}>
            <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowPicker(true)}
            >
                <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                <Text style={styles.datePickerText}>{selectedDate}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={showPicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowPicker(false)}
                >
                    <View style={styles.datePickerModal}>
                        <Text style={styles.modalTitle}>Select Date</Text>
                        {dates.map((date, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dateOption,
                                    selectedDate === date && styles.selectedDateOption,
                                ]}
                                onPress={() => {
                                    onDateChange(date);
                                    setShowPicker(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dateOptionText,
                                        selectedDate === date && styles.selectedDateOptionText,
                                    ]}
                                >
                                    {date}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

// Activity Details Modal
const ActivityDetailsModal = ({ visible, activity, onClose }) => {
    if (!activity) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.detailsModal}>
                <View style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Activity Details</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.detailsContent}>
                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsLabel}>Time</Text>
                        <Text style={styles.detailsValue}>
                            {activity.time} - {activity.date}
                        </Text>
                    </View>

                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsLabel}>Information</Text>
                        <Text style={styles.detailsValue}>{activity.info}</Text>
                    </View>

                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsLabel}>Location</Text>
                        <View style={styles.locationDetailContainer}>
                            <Ionicons name="location" size={20} color="#2196F3" />
                            <Text style={styles.detailsValue}>{activity.location}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsSection}>
                        <Text style={styles.detailsLabel}>Category</Text>
                        <Text style={styles.detailsValue}>{activity.category}</Text>
                    </View>

                    {activity.duration && (
                        <View style={styles.detailsSection}>
                            <Text style={styles.detailsLabel}>Duration</Text>
                            <Text style={styles.detailsValue}>{activity.duration}</Text>
                        </View>
                    )}

                    {activity.notes && (
                        <View style={styles.detailsSection}>
                            <Text style={styles.detailsLabel}>Notes</Text>
                            <Text style={styles.detailsValue}>{activity.notes}</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

// Main Activity Component
export default function Activity() {
    const [selectedDate, setSelectedDate] = useState("Today");
    const [activeTab, setActiveTab] = useState("Activity");
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const DUMMY_DATA = [
        {
            id: "1",
            time: "09:00",
            date: "Dec 12, 2024",
            info: "Started work day - Morning standup meeting",
            location: "Office Building A, Floor 3",
            category: "Clock In",
            duration: "8 hours",
            notes: "On time arrival, attended team meeting to discuss project updates and daily goals.",
        },
        {
            id: "2",
            time: "13:00",
            date: "Dec 12, 2024",
            info: "Lunch break started",
            location: "Office Cafeteria",
            category: "Break",
            duration: "1 hour",
            notes: "Had lunch with colleagues, discussed upcoming project deadlines.",
        },
        {
            id: "3",
            time: "14:00",
            date: "Dec 12, 2024",
            info: "Resumed work after lunch",
            location: "Office Building A, Floor 3",
            category: "Clock In",
            duration: "4 hours",
        },
        {
            id: "4",
            time: "16:30",
            date: "Dec 12, 2024",
            info: "Client meeting - Project presentation",
            location: "Conference Room B",
            category: "Meeting",
            duration: "1.5 hours",
            notes: "Presented quarterly results to client. Received positive feedback and discussed next phase requirements.",
        },
        {
            id: "5",
            time: "18:00",
            date: "Dec 12, 2024",
            info: "End of work day",
            location: "Office Building A, Floor 3",
            category: "Clock Out",
            notes: "Completed all assigned tasks for the day. Ready for tomorrow's challenges.",
        },
    ];

    const navigationTabs = [
        { name: "Home", icon: "home-outline" },
        { name: "Activity", icon: "list-outline" },
        { name: "Profile", icon: "person-outline" },
    ];

    const handleActivityPress = (activity) => {
        setSelectedActivity(activity);
        setShowDetails(true);
    };

    const filteredData = selectedDate === "Today" ? DUMMY_DATA : DUMMY_DATA.slice(0, 2);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Activity History</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter-outline" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            {/* Date Picker */}
            <DatePicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            {/* Navigation Tabs */}
            <View style={styles.navigationTabs}>
                {navigationTabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.name}
                        style={[
                            styles.navTab,
                            activeTab === tab.name && styles.activeNavTab,
                        ]}
                        onPress={() => setActiveTab(tab.name)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={activeTab === tab.name ? "#2196F3" : "#666"}
                        />
                        <Text
                            style={[
                                styles.navTabText,
                                activeTab === tab.name && styles.activeNavTabText,
                            ]}
                        >
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Activity List */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>
                    {filteredData.length} activities on {selectedDate}
                </Text>
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ActivityItem item={item} onPress={handleActivityPress} />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            </View>

            {/* Activity Details Modal */}
            <ActivityDetailsModal
                visible={showDetails}
                activity={selectedActivity}
                onClose={() => setShowDetails(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    filterButton: {
        padding: 8,
    },
    datePickerContainer: {
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    datePickerText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: "#333",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    datePickerModal: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        minWidth: 200,
        maxWidth: 300,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        color: "#333",
    },
    dateOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 2,
    },
    selectedDateOption: {
        backgroundColor: "#e3f2fd",
    },
    dateOptionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    selectedDateOptionText: {
        color: "#2196F3",
        fontWeight: "600",
    },
    navigationTabs: {
        flexDirection: "row",
        backgroundColor: "white",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    navTab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    activeNavTab: {
        backgroundColor: "#e3f2fd",
    },
    navTabText: {
        marginLeft: 6,
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    activeNavTabText: {
        color: "#2196F3",
        fontWeight: "600",
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    activityItem: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activityHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    timeContainer: {
        flex: 1,
    },
    timeText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    dateText: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    categoryText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },
    activityBody: {
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 6,
        lineHeight: 22,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 6,
    },
    notesText: {
        fontSize: 14,
        color: "#888",
        fontStyle: "italic",
        lineHeight: 20,
    },
    detailsModal: {
        flex: 1,
        backgroundColor: "white",
    },
    detailsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    detailsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    closeButton: {
        padding: 8,
    },
    detailsContent: {
        flex: 1,
        padding: 16,
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailsLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 6,
    },
    detailsValue: {
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
    },
    locationDetailContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
});