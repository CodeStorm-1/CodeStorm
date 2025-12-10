import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Confirm() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Review & Confirm</Text>

      <View style={styles.card}>
        <Text style={styles.label}>From:</Text>
        <Text style={styles.value}>Mumbai</Text>

        <Text style={styles.label}>To:</Text>
        <Text style={styles.value}>Pune</Text>

        <Text style={styles.label}>Date & Time:</Text>
        <Text style={styles.value}>12 Jan 2025 - 10:30 AM</Text>

        <Text style={styles.label}>Stops:</Text>
        <Text style={styles.value}>Thane, Lonavala</Text>
      </View>

      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Publish Ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 25 },

  card: {
    backgroundColor: "#fafafa",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },

  value: {
    fontSize: 18,
    fontWeight: "500",
  },

  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
