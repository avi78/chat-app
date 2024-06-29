import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function Dashboard({ route }) {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore().collection("users").get();
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.log("Error fetching users: ", error);
      }
    };

    const fetchUserName = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userDocument = await firestore()
            .collection("users")
            .doc(currentUser.uid)
            .get();
          setUserName(userDocument.data()?.name || "");
        }
      } catch (error) {
        console.log("Error fetching user's name: ", error);
      }
    };

    if (isFocused) {
      fetchUsers();
      fetchUserName();
    }
  }, [isFocused]);

  const navigateToChat = (userId, userName) => {
    navigation.navigate("ChatScreen", {
      userId,
      userName,
    });
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate("Login");
    } catch (error) {
      console.log("Error logging out: ", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient colors={["#6DD5FA", "#2980B9"]} style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Welcome, {userName}</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.body}>
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigateToChat(item.id, item.name)}
                style={styles.userItem}
              >
                <LinearGradient
                  colors={["#3b5998", "#8b9dc3"]}
                  style={styles.userGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.userName}>{item.name}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "#fff",
  },
  logoutText: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userItem: {
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userGradient: {
    padding: 15,
    borderRadius: 10,
  },
  userName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});
