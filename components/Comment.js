import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const Comment = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      user: 'MaiLinhe1590a40fda54d67_99826',
      avatar: 'M',
      text: 'Ai có cách chỉ mình với nha 😊',
      date: 'Tháng 10. 23, 2024',
      replies: [],
    },
    {
      id: '2',
      user: 'tashahd',
      avatar: 'T',
      text: 'p6 mình hay sai phần điền nguyên câu có cách nào khắc phục không ạ',
      date: 'Tháng 10. 23, 2024',
      replies: [],
    },
  ]);
  const [reply, setReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyToReply, setReplyToReply] = useState(null);

  const addComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: String(comments.length + 1),
        user: 'CurrentUser',
        avatar: 'U',
        text: comment,
        date: new Date().toLocaleDateString('vi-VN', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        replies: [],
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  const addReply = (commentId, parentReplyId = null) => {
    if (reply.trim()) {
      const newReply = {
        id: String(new Date().getTime()),
        user: 'DatDeptrai',
        avatar: 'D',
        text: reply,
        date: new Date().toLocaleDateString('vi-VN', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      };
      setComments(comments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              replies: parentReplyId
                ? comment.replies.map(reply =>
                    reply.id === parentReplyId
                      ? { ...reply, replies: [newReply, ...(reply.replies || [])] }
                      : reply
                  )
                : [newReply, ...comment.replies],
            }
          : comment
      ));
      setReply('');
      setReplyingTo(null);
      setReplyToReply(null);
    }
  };

  const renderReply = (replyItem) => (
    <View key={replyItem.id} style={styles.replyItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{replyItem.avatar}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{replyItem.user}</Text>
          <Text style={styles.commentDate}>{replyItem.date}</Text>
        </View>
        <Text style={styles.commentText}>{replyItem.text}</Text>
        <TouchableOpacity style={styles.replyButton} onPress={() => setReplyToReply(replyItem.id)}>
          <Text style={styles.replyButtonText}>Trả lời</Text>
        </TouchableOpacity>
        {replyToReply === replyItem.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Viết phản hồi..."
              value={reply}
              onChangeText={setReply}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => addReply(replyItem.id)} disabled={!reply.trim()}>
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        )}
        {replyItem.replies && replyItem.replies.map(renderReply)}
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.commentDate}>{item.date}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity style={styles.replyButton} onPress={() => setReplyingTo(item.id)}>
          <Text style={styles.replyButtonText}>Trả lời</Text>
        </TouchableOpacity>
        {replyingTo === item.id && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Viết phản hồi..."
              value={reply}
              onChangeText={setReply}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => addReply(item.id)} disabled={!reply.trim()}>
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.replies.map(renderReply)}
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TextInput
          style={styles.input}
          placeholder="Chia sẻ cảm nghĩ của bạn..."
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={addComment} disabled={!comment.trim()}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={comments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  commentItem: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
  },
  commentDate: {
    color: '#777',
  },
  commentText: {
    marginBottom: 8,
  },
  replyButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  replyItem: {
    flexDirection: 'row',
    marginVertical: 8,
    padding: 12,
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
    marginLeft: 40,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});

export default Comment;
