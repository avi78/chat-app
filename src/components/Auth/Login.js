import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [confirm, setConfirm] = useState(null);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const signInWithPhoneNumber = async () => {
    try {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phoneNumber)) {
        alert(
          "Invalid phone number format. Please enter a valid 10-digit number."
        );
        return;
      }

      const formattedPhoneNumber = `+91${phoneNumber}`;
      const confirmation = await auth().signInWithPhoneNumber(
        formattedPhoneNumber
      );
      setConfirm(confirmation);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      alert("Error sending code. Please try again later.");
      console.log("Error sending code: ", error);
    }
  };

  const confirmCode = async () => {
    try {
      const enteredCode = code.join("");
      if (!enteredCode || enteredCode.length !== 6) {
        alert("Invalid code. Please enter a 6-digit code.");
        return;
      }

      const userCredential = await confirm.confirm(enteredCode);
      const user = userCredential.user;

      const userDocument = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      if (userDocument.exists) {
        navigation.navigate("Dashboard");
      } else {
        navigation.navigate("Detail", { uid: user.uid });
      }
    } catch (error) {
      alert("Invalid code. Please enter the correct code.");
      console.log("Invalid code.", error);
    }
  };

  const handleCodeChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        const nextInput = index + 1;
        inputRefs[nextInput].focus();
      }
    }
  };

  const inputRefs = [];

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat App</Text>
        <Image
          source={require("../../../assets/logo1.jpg")}
          style={styles.logo}
        />
      </View>
      <View style={styles.body}>
        {!confirm ? (
          <>
            <Text style={styles.instruction}>
              Enter your phone number with country code:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 9999999999" // phone number
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={signInWithPhoneNumber}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Verify Phone Number</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.instruction}>
              Enter the code sent to your phone:
            </Text>
            <Animated.View
              style={[styles.codeInputContainer, { opacity: fadeAnim }]}
            >
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.codeInput}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(index, value)}
                  keyboardType="number-pad"
                  maxLength={1}
                  ref={(ref) => (inputRefs[index] = ref)}
                />
              ))}
            </Animated.View>
            <TouchableOpacity onPress={confirmCode} style={styles.button}>
              <Text style={styles.buttonText}>Confirm Code</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  body: {
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 20,
  },
  instruction: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  codeInput: {
    width: "15%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
