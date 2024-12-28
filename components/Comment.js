import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { API_BASE_URL } from "@env";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Comment = ({ idTest }) => {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});

  const fetchComments = async (pageNum = 1) => {
    if (loading || !hasMore) return;
  
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}:3001/api/v1/comment/test/${idTest}`,
        {
          params: { page: pageNum, limit: 10 },
        }
      );
  
      const newComments = response.data.map((comment) => ({
        ...comment,
        subComment: comment.subComment || [], // Bảo đảm subComment luôn tồn tại
        expanded: false, // Thêm cờ để quản lý trạng thái mở rộng
      }));
  
      setComments((prev) =>
        pageNum === 1 ? newComments : [...prev, ...newComments]
      );
  
      setHasMore(newComments.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchComments(1);
  }, [idTest]);

  const loadMoreComments = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1);
    }
  };

  const toggleSubComments = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const addComment = async () => {
    if (comment.trim()) {
      try {
        const newComment = {
          content: comment,
          idTest: idTest,
        };
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }
        const response = await axios.post(
          `${API_BASE_URL}:3001/api/v1/comment/`,
          newComment,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setComments([response.data, ...comments]);
        setComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const addReply = async (commentId) => {
    console.log(reply[commentId]);
    if (reply[commentId]?.trim()) {
      try {
        const newReply = {
          content: reply[commentId],
          idComment: commentId,
        };
  
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }
  
        const response = await axios.post(
          `${API_BASE_URL}:3001/api/v1/comment`,
          newReply,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  subComment: [response.data, ...(comment.subComment || [])],
                  expanded: true,
                }
              : comment
          )
        );
  
        setReply((prev) => ({ ...prev, [commentId]: "" }));
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    }
  };      

  const renderFooter = () => {
    return loading ? (
      <View style={styles.loadingContainer}>
        <Text>Loading more comments...</Text>
      </View>
    ) : null;
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: item.user.avatar || "default-avatar.png" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => {
            setReply((prev) => ({
              ...prev,
              [item.id]: prev[item.id] ? "" : prev[item.id] || "",
            }));
          }}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      </View>
  
      {item.subComment && item.subComment.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.subComment.map((subComment) => (
            <View key={subComment.id} style={styles.replyBubble}>
              <View style={styles.replyHeader}>
                <Image
                  source={{ uri: subComment.user.avatar || "default-avatar.png" }}
                  style={styles.replyAvatar}
                />
                <Text style={styles.replyUserName}>{subComment.user.name}</Text>
              </View>
              <Text style={styles.replyText}>{subComment.content}</Text>
            </View>
          ))}
        </View>
      )}
  
      {reply[item.id] !== undefined && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor="#6B7280"
            value={reply[item.id]}
            onChangeText={(text) =>
              setReply((prev) => ({ ...prev, [item.id]: text }))
            }
            multiline
          />
          <TouchableOpacity
            style={styles.sendReplyButton}
            onPress={() => addReply(item.id)}
          >
            <Text style={styles.sendReplyButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );  

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            onEndReached={loadMoreComments}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No comments yet. Be the first to comment!
              </Text>
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              flexGrow: 1, // Ensures FlatList can scroll
              paddingBottom: 80, // Prevents overlap with the input field
            }}
          />
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your thoughts..."
              placeholderTextColor="#6B7280"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !comment.trim() && styles.sendButtonDisabled,
              ]}
              onPress={addComment}
              disabled={!comment.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  commentInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderColor: "#BDBDBD",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#212121",
  },
  sendButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#BBDEFB",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  commentList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  commentContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
  },
  timestamp: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 4,
  },
  commentText: {
    fontSize: 16,
    color: "#616161",
    lineHeight: 24,
    marginBottom: 12,
  },
  replyButton: {
    backgroundColor: "#E3F2FD",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  replyButtonText: {
    color: "#1E88E5",
    fontSize: 14,
    fontWeight: "500",
  },
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: "#E0E0E0",
  },
  replyBubble: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#424242",
  },
  replyText: {
    fontSize: 14,
    color: "#757575",
    marginTop: 4,
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    borderColor: "#BDBDBD",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 14,
    color: "#212121",
  },
  sendReplyButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  sendReplyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#9E9E9E",
    fontSize: 16,
    marginTop: 32,
  },
});



export default Comment;
