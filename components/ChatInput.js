// components/ChatInput.js
import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { storage, auth, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const EMOJIS = ["😀", "😂", "😍", "🔥", "👍", "❤️", "😎", "🤯"];

export default function ChatInput({ chatId }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const chatRef = collection(db, "chats", chatId, "messages");
  const typingRef = doc(db, "chats", chatId, "typing", auth.currentUser.uid);

  useEffect(() => {
    const updateTyping = async () => {
      await setDoc(
        typingRef,
        {
          isTyping: text.length > 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    };
    updateTyping();
  }, [text]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(chatRef, {
      text: text.trim(),
      imageUrl: null,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const resp = await fetch(uri);
      const blob = await resp.blob();

      const storageRef = ref(storage, `chatImages/${chatId}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);

      await addDoc(chatRef, {
        text: null,
        imageUrl: url,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setShowEmoji((prev) => !prev)}>
          <Ionicons name="happy-outline" size={26} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
        />

        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="image-outline" size={26} />
        </TouchableOpacity>

        <TouchableOpacity onPress={sendMessage}>
          <Ionicons name="send" size={26} />
        </TouchableOpacity>
      </View>

      {showEmoji && (
        <View style={styles.emojiRow}>
          {EMOJIS.map((e) => (
            <Text key={e} style={styles.emoji} onPress={() => addEmoji(e)}>
              {e}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingBottom: 4,
    gap: 6,
  },
  emoji: { fontSize: 24 },
});
