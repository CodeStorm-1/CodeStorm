import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Intermediate() {
  const [stop, setStop] = useState("");
  const [stops, setStops] = useState<string[]>([]);

  const addStop = () => {
    if (stop.trim() !== "") {
      setStops([...stops, stop]);
      setStop("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Stops</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter stop name"
          style={styles.input}
          value={stop}
          onChangeText={setStop}
        />
        <TouchableOpacity onPress={addStop} style={styles.addBtn}>
          <MaterialIcons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={stops}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.stopItem}>
            <MaterialIcons name="location-on" size={20} color="#ff6b6b" />
            <Text style={styles.stopText}>{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },

  addBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
  },

  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 10,
  },

  stopText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
