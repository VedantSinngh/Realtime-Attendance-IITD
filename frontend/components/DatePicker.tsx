import React, { useState } from "react";
import { View, Platform, TouchableOpacity, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerProps {
    date: Date;
    setDate: (date: Date) => void;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
    const [show, setShow] = useState(false);

    const onChange = (event: any, selectedDate?: Date) => {
        setShow(Platform.OS === "ios"); // keep picker open on iOS
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    return (
        <View>
            <TouchableOpacity
                style={{
                    flex: 1,
                    paddingVertical: 10,
                }}
                onPress={() => setShow(true)}
            >
                <Text style={{ fontSize: 16 }}>{date.toDateString()}</Text>
            </TouchableOpacity>

            {show && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "calendar"}
                    onChange={onChange}
                />
            )}
        </View>
    );
}
