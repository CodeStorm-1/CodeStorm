import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // ✅ Correct import

type DateTimeMode = "date" | "time";

export default function BookingDateTime() {
  const [selected, setSelected] = useState<Date | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [mode, setMode] = useState<DateTimeMode>("date");
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const showPicker = (newMode: DateTimeMode) => {
    setMode(newMode);
    setPickerVisible(true);
  };

  const hidePicker = () => {
    setPickerVisible(false);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined
  ) => {
    if (Platform.OS === "android") {
      setPickerVisible(false);
    }

    if (!selectedDate) return;

    if (mode === "date") {
      const current = selected ?? new Date();
      const combined = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        current.getHours(),
        current.getMinutes()
      );
      setSelected(combined);
      setTempDate(combined);

      if (Platform.OS === "android") {
        setTimeout(() => showPicker("time"), 300);
      } else {
        setMode("time");
      }
    } else {
      const current = selected ?? new Date();
      const combined = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes()
      );
      setSelected(combined);
      setTempDate(combined);

      if (Platform.OS === "ios") {
        hidePicker();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Select Date & Time</Text>

      <TouchableOpacity onPress={() => showPicker("date")} style={styles.btn}>
        <MaterialCommunityIcons
          name="calendar"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.btnText}>
          {selected
            ? format(selected, "PPP") + " at " + format(selected, "p")
            : "Select date & time"}
        </Text>
      </TouchableOpacity>

      {selected && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedLabel}>✓ Selected:</Text>
          <Text style={styles.selectedText}>
            {format(selected, "EEEE, MMMM d, yyyy")}
          </Text>
          <Text style={styles.selectedTime}>{format(selected, "h:mm a")}</Text>
        </View>
      )}

      {isPickerVisible && (
        <Modal
          transparent
          animationType="slide"
          visible={isPickerVisible}
          onRequestClose={hidePicker}
        >
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={hidePicker}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>
                {mode === "date" ? "Select Date" : "Select Time"}
              </Text>
              <TouchableOpacity onPress={hidePicker}>
                <Text style={styles.doneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tempDate || new Date()}
              mode={mode}
              display={Platform.OS === "ios" ? "spinner" : "spinner"}
              onChange={handleDateChange}
              minimumDate={new Date()}
              is24Hour={true}
              textColor="#333"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  btn: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedBox: {
    backgroundColor: "#E3F2FD",
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    width: "100%",
  },
  selectedLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    marginBottom: 8,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
    marginBottom: 4,
  },
  selectedTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976D2",
  },
  pickerModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cancelButton: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  doneButton: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
