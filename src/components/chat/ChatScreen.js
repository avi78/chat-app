import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { Bubble, GiftedChat } from "react-native-gifted-chat";
import { LinearGradient } from "expo-linear-gradient";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { formatTimestamp } from "../../utils/helpers";
import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [inputText, setInputText] = useState("");
  const { userId, userName } = useRoute().params;
  const currentUser = auth().currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const chatId = [currentUser.uid, userId].sort().join("_");
    const chatReference = firestore().collection("chats").doc(chatId);

    const unsubscribe = chatReference.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const chatData = snapshot.data();
        setMessages(chatData.messages);
      }
    });

    return () => unsubscribe();
  }, [userId, currentUser.uid]);

  const onSend = async (newMessages = []) => {
    const chatId = [currentUser.uid, userId].sort().join("_");
    const chatReference = firestore().collection("chats").doc(chatId);

    const formattedMessages = newMessages.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
    try {
      await chatReference.set(
        {
          messages: GiftedChat.append(messages, formattedMessages),
        },
        { merge: true }
      );
    } catch (error) {
      console.log("Error updating messages: ", error);
    }
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isReceived = currentMessage.user._id !== currentUser.uid;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#0078d4",
            marginLeft: isReceived ? 0 : 10,
          },
          left: {
            backgroundColor: "#f1f0f0",
            marginLeft: isReceived ? -40 : 0,
          },
        }}
        textStyle={{
          right: {
            color: "white",
          },
          left: {
            color: "black",
          },
        }}
      />
    );
  };

  const renderTime = (props) => {
    const { currentMessage } = props;
    const time =
      currentMessage.createdAt instanceof Date
        ? currentMessage.createdAt.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
        : formatTimestamp(currentMessage.createdAt);

    return (
      <View style={props.containerStyle}>
        <Text
          style={{
            marginHorizontal: 10,
            marginBottom: 5,
            fontSize: 10,
            color: props.position === "left" ? "#7e7e7e" : "#d1d1d1",
          }}
        >
          {time}
        </Text>
      </View>
    );
  };

  const renderChatFooter = () => {
    return <View style={{ height: 20 }} />;
  };

  return (
    <LinearGradient colors={["#00416A", "#E4E5E6"]} style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(newMessages) => onSend(newMessages)}
        user={{ _id: currentUser.uid, name: currentUser.displayName }}
        renderTime={renderTime}
        renderDay={() => null}
        renderBubble={renderBubble}
        renderChatFooter={renderChatFooter}
        renderInputToolbar={() => null} // Remove the default input toolbar
      />
      {Platform.OS === "android" && <KeyboardAvoidingView behavior="padding" />}

      {/* Emoji Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEmojiSelector}
        onRequestClose={() => {
          setShowEmojiSelector(!showEmojiSelector);
        }}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <EmojiSelector
            category={Categories.all}
            onEmojiSelected={(emoji) => {
              setInputText(inputText + emoji);
              setShowEmojiSelector(false);
            }}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowEmojiSelector(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Input area with emoji button */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiSelector(true)}
        >
          <Text style={styles.emojiButtonText}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => {
            if (inputText.trim()) {
              onSend([
                {
                  text: inputText,
                  user: { _id: currentUser.uid },
                  createdAt: new Date(),
                },
              ]);
              setInputText("");
            }
          }}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    backgroundColor: "#0078d4",
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFF",
  },
  emojiButton: {
    padding: 10,
  },
  emojiButtonText: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#EFEFEF",
    borderRadius: 20,
    marginHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#0078d4",
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
  },
});
