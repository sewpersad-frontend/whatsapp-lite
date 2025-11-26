// components/MessageBubble.js
import { View, Text, Image, StyleSheet } from "react-native";
import { auth } from "../firebase";

export default function MessageBubble({ message }) {
  const isMe = message.userId === auth.currentUser?.uid;

  return (
    <View
      style={[styles.container, isMe ? styles.rightAlign : styles.leftAlign]}
    >
      <View
        style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
      >
        {message.text ? <Text style={styles.text}>{message.text}</Text> : null}
        {message.imageUrl ? (
          <Image source={{ uri: message.imageUrl }} style={styles.image} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4, paddingHorizontal: 8 },
  leftAlign: { alignItems: "flex-start" },
  rightAlign: { alignItems: "flex-end" },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    padding: 10,
  },
  myBubble: { backgroundColor: "#DCF8C6" },
  theirBubble: { backgroundColor: "#eee" },
  text: { fontSize: 15 },
  image: { marginTop: 6, width: 200, height: 200, borderRadius: 12 },
});
