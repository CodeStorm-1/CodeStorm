import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format, isBefore, startOfDay } from "date-fns";
import { useDriverRouteStore } from "@/store/driverRoute-store";
import { useLocationStore } from "@/store/location-store";
import { router } from "expo-router";

type PickerStep = "initial" | "date" | "time" | "pickup-question";

export default function BookingDateTime() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{
    hours: number;
    minutes: number;
  }>({
    hours: 9,
    minutes: 0,
  });
  const [step, setStep] = useState<PickerStep>("initial");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const setState = useLocationStore((state) => state.setState);

  // Validation: No back dating
  const isDateAllowed = (date: Date) => {
    const today = startOfDay(new Date());
    return !isBefore(date, today);
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    if (isDateAllowed(newDate)) {
      setSelectedDate(newDate);
      setStep("time");
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
  };

  const handleConfirmDateTime = () => {
    setStep("pickup-question");
  };

  const handleConfirmPickup = () => {
    // Done! You can pass the data to parent or API
    setState({
      date: selectedDate,
      time: `${selectedTime.hours.toString().padStart(2, "0")}:${selectedTime.minutes
        .toString()
        .padStart(2, "0")}`,
    });

    router.push("/publish_pages/vehicle");
  };

  const today = startOfDay(new Date());
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      {/* Initial Screen */}
      {step === "initial" && (
        <View style={styles.initialScreen}>
          <Text style={styles.mainTitle}>
            When do you want to start your ride?
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setCurrentMonth(new Date());
              setStep("date");
            }}
          >
            <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Select Date & Time</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          {selectedDate && (
            <View style={styles.selectedCard}>
              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color="#34C759"
              />
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedDate}>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </Text>
                <Text style={styles.selectedTimeText}>
                  {selectedTime.hours.toString().padStart(2, "0")}:
                  {selectedTime.minutes.toString().padStart(2, "0")}{" "}
                  {selectedTime.hours >= 12 ? "PM" : "AM"}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Date Picker Screen */}
      {step === "date" && (
        <View style={styles.datePickerScreen}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep("initial")}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color="#007AFF"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {format(currentMonth, "MMMM yyyy")}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1
                  )
                )
              }
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={28}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            {/* Day headers */}
            <View style={styles.dayHeaders}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <Text key={day} style={styles.dayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days grid */}
            <View style={styles.daysGrid}>
              {/* Empty cells before month starts */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyCell} />
              ))}

              {/* Days of month */}
              {days.map((day) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  day
                );
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentMonth.getMonth() &&
                  selectedDate.getFullYear() === currentMonth.getFullYear();
                const isDisabled = !isDateAllowed(date);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelected && styles.selectedDayCell,
                      isDisabled && styles.disabledDayCell,
                      isToday && !isDisabled && styles.todayDayCell,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={isDisabled}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isDisabled && styles.disabledDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {selectedDate && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setStep("time")}
            >
              <Text style={styles.continueButtonText}>Continue to Time</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Time Picker Screen with Clock */}
      {step === "time" && (
        <View style={styles.timePickerScreen}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setStep("date")}>
              <MaterialCommunityIcons
                name="chevron-left"
                size={28}
                color="#007AFF"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Select Time</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Analog Clock */}
          <View style={styles.clockContainer}>
            <AnalogClock
              hours={selectedTime.hours}
              minutes={selectedTime.minutes}
              onTimeChange={handleTimeChange}
            />
          </View>

          {/* Digital Time Display */}
          <View style={styles.digitalTimeContainer}>
            <Text style={styles.digitalTime}>
              {selectedTime.hours.toString().padStart(2, "0")}:
              {selectedTime.minutes.toString().padStart(2, "0")}
            </Text>
            <Text style={styles.ampmText}>
              {selectedTime.hours >= 12 ? "PM" : "AM"}
            </Text>
          </View>

          {/* Time Increment Buttons */}
          <View style={styles.timeControlsContainer}>
            <View style={styles.timeControl}>
              <Text style={styles.timeLabel}>Hours</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() =>
                    handleTimeChange(
                      (selectedTime.hours + 1) % 24,
                      selectedTime.minutes
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {selectedTime.hours.toString().padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() =>
                    handleTimeChange(
                      selectedTime.hours === 0 ? 23 : selectedTime.hours - 1,
                      selectedTime.minutes
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="minus"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeControl}>
              <Text style={styles.timeLabel}>Minutes</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() =>
                    handleTimeChange(
                      selectedTime.hours,
                      (selectedTime.minutes + 15) % 60
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
                <Text style={styles.timeValue}>
                  {selectedTime.minutes.toString().padStart(2, "0")}
                </Text>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() =>
                    handleTimeChange(
                      selectedTime.hours,
                      selectedTime.minutes === 0
                        ? 45
                        : selectedTime.minutes - 15
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="minus"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleConfirmDateTime}
          >
            <Text style={styles.primaryButtonText}>Confirm & Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pickup Question Screen */}
      {step === "pickup-question" && (
        <View style={styles.pickupQuestionScreen}>
          <MaterialCommunityIcons
            name="check-circle"
            size={80}
            color="#34C759"
          />
          <Text style={styles.confirmTitle}>Perfect!</Text>
          <Text style={styles.confirmSubtitle}>
            Ride scheduled for {format(selectedDate!, "EEEE, MMMM d")}
          </Text>
          <Text style={styles.confirmTime}>
            {selectedTime.hours.toString().padStart(2, "0")}:
            {selectedTime.minutes.toString().padStart(2, "0")}{" "}
            {selectedTime.hours >= 12 ? "PM" : "AM"}
          </Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              🚗 Ready to start your ride at this time?
            </Text>
          </View>

          <TouchableOpacity
            style={styles.yesButton}
            onPress={handleConfirmPickup}
          >
            <MaterialCommunityIcons name="check" size={20} color="#fff" />
            <Text style={styles.yesButtonText}>Yes, Publish Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.noButton}
            onPress={() => setStep("time")}
          >
            <Text style={styles.noButtonText}>Change Time</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// Analog Clock Component
const AnalogClock = ({
  hours,
  minutes,
  onTimeChange,
}: {
  hours: number;
  minutes: number;
  onTimeChange: (h: number, m: number) => void;
}) => {
  const clockSize = 280;
  const radius = clockSize / 2;
  const centerX = radius;
  const centerY = radius;

  // Hour hand angle (30 degrees per hour)
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  // Minute hand angle (6 degrees per minute)
  const minuteAngle = minutes * 6;

  const hourX = centerX + 80 * Math.sin((hourAngle * Math.PI) / 180);
  const hourY = centerY - 80 * Math.cos((hourAngle * Math.PI) / 180);

  const minuteX = centerX + 100 * Math.sin((minuteAngle * Math.PI) / 180);
  const minuteY = centerY - 100 * Math.cos((minuteAngle * Math.PI) / 180);

  return (
    <View style={styles.clockFace}>
      <View style={styles.clockNumbers}>
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = centerX + 110 * Math.sin(angle);
          const y = centerY - 110 * Math.cos(angle);
          return (
            <View
              key={num}
              style={[styles.clockNumber, { left: x - 15, top: y - 15 }]}
            >
              <Text style={styles.clockNumberText}>{num === 0 ? 12 : num}</Text>
            </View>
          );
        })}
      </View>

      {/* Hour hand */}
      <View
        style={[
          styles.hand,
          styles.hourHand,
          {
            transform: [{ rotate: `${hourAngle}deg` }],
          },
        ]}
      />

      {/* Minute hand */}
      <View
        style={[
          styles.hand,
          styles.minuteHand,
          {
            transform: [{ rotate: `${minuteAngle}deg` }],
          },
        ]}
      />

      {/* Center dot */}
      <View style={styles.centerDot} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  initialScreen: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 40,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  selectedCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  selectedInfo: {
    marginLeft: 12,
    flex: 1,
  },
  selectedDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B5E20",
    marginTop: 4,
  },
  // Date Picker
  datePickerScreen: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  calendarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    width: "14.28%",
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyCell: {
    width: "14.28%",
    height: 50,
  },
  dayCell: {
    width: "14.28%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedDayCell: {
    backgroundColor: "#007AFF",
  },
  todayDayCell: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  disabledDayCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  selectedDayText: {
    color: "#fff",
  },
  disabledDayText: {
    color: "#999",
  },
  continueButton: {
    backgroundColor: "#34C759",
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Time Picker
  timePickerScreen: {
    flex: 1,
    paddingBottom: 20,
  },
  clockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  clockFace: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 3,
    borderColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  clockNumbers: {
    position: "absolute",
    width: 280,
    height: 280,
  },
  clockNumber: {
    position: "absolute",
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  clockNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  hand: {
    position: "absolute",
    backgroundColor: "#333",
    transformOrigin: "bottom center",
  },
  hourHand: {
    width: 6,
    height: 80,
    bottom: "50%",
    marginLeft: -3,
  },
  minuteHand: {
    width: 4,
    height: 100,
    bottom: "50%",
    backgroundColor: "#007AFF",
    marginLeft: -2,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  digitalTimeContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  digitalTime: {
    fontSize: 56,
    fontWeight: "700",
    color: "#007AFF",
  },
  ampmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  timeControlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeControl: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  buttonGroup: {
    alignItems: "center",
  },
  incrementButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginVertical: 8,
  },
  // Pickup Question
  pickupQuestionScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  confirmTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginTop: 20,
  },
  confirmSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    textAlign: "center",
  },
  confirmTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    marginTop: 8,
  },
  questionBox: {
    backgroundColor: "#FFF3CD",
    padding: 16,
    borderRadius: 12,
    marginVertical: 30,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  yesButton: {
    flexDirection: "row",
    backgroundColor: "#34C759",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "100%",
  },
  yesButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  noButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  noButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
