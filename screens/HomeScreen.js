// screens/HomeScreen.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { auth, db, setUserOffline } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { buildChatId } from "../utils/chatUtils";

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "users"),
      where("uid", "!=", auth.currentUser?.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => doc.data()));
    });

    return unsub;
  }, []);

  const logout = async () => {
    await setUserOffline(auth.currentUser);
    auth.signOut();
  };

  const openChat = (otherUser) => {
    const chatId = buildChatId(auth.currentUser.uid, otherUser.uid);
    navigation.navigate("Chat", {
      chatId,
      otherUser,
      title: otherUser.displayName || otherUser.email,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Button title="Logout" onPress={logout} />
      </View>

      {users.length === 0 ? (
        <Text>No other users yet. Create another account to test.</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => openChat(item)}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: item.online ? "green" : "gray" },
                ]}
              />
              <View>
                <Text style={styles.name}>
                  {item.displayName || item.email}
                </Text>
                <Text style={styles.subtitle}>
                  {item.online ? "Online" : "Offline"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  name: { fontSize: 16, fontWeight: "500" },
  subtitle: { fontSize: 12, color: "#666" },
});
