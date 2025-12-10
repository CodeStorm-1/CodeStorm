import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DateTimeScreen() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (_: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Date & Time</Text>

      <TouchableOpacity style={styles.dateBox} onPress={() => setShow(true)}>
        <Text style={styles.dateText}>{date.toLocaleString()}</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={date}
          mode="datetime"
          display="spinner"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  dateBox: {
    padding: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
  },

  dateText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
