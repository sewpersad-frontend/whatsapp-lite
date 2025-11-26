// screens/ChatScreen.js
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  onSnapshot as onDocSnapshot,
} from "firebase/firestore";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";

export default function ChatScreen({ route }) {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [otherUserState, setOtherUserState] = useState(otherUser);

  const chatRef = collection(db, "chats", chatId, "messages");
  const typingRef = doc(db, "chats", chatId, "typing", otherUser.uid);
  const otherUserRef = doc(db, "users", otherUser.uid);

  useEffect(() => {
    const q = query(chatRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    const unsubTyping = onDocSnapshot(typingRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTyping(!!data.isTyping);
      } else {
        setTyping(false);
      }
    });

    const unsubUser = onDocSnapshot(otherUserRef, (snap) => {
      if (snap.exists()) setOtherUserState(snap.data());
    });

    return () => {
      unsubTyping();
      unsubUser();
    };
  }, [chatId]);

  const renderItem = ({ item }) => <MessageBubble message={item} />;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: otherUserState.online ? "green" : "gray" },
          ]}
        />
        <Text style={styles.statusText}>
          {otherUserState.online ? "Online" : "Offline"}
        </Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messages}
      />

      {typing && (
        <Text style={styles.typingText}>
          {otherUserState.displayName || "User"} is typing...
        </Text>
      )}

      <ChatInput chatId={chatId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 13, color: "#444" },
  messages: { paddingVertical: 8 },
  typingText: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 13,
    color: "#888",
  },
});
