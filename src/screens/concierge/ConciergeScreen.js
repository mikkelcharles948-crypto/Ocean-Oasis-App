import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ScreenHeader } from '../../components/UI';
import { colors, spacing, radius, font } from '../../theme/theme';
import { CONCIERGE_FAQ } from '../../data/mockData';

function findAnswer(question) {
  const lower = question.toLowerCase();
  const match = CONCIERGE_FAQ.find((f) => f.question.toLowerCase() === lower);
  if (match) return match.answer;
  const partial = CONCIERGE_FAQ.find((f) =>
    lower.split(' ').some((word) => word.length > 3 && f.question.toLowerCase().includes(word))
  );
  return partial
    ? partial.answer
    : "I can help with hotel services, activities, dining, and events. Try one of the suggested questions below, or contact reception for anything more specific.";
}

export default function ConciergeScreen({ navigation }) {
  const [messages, setMessages] = useState([
    { id: 'm0', role: 'concierge', text: 'How can we help make your stay better?' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'user', text };
    const answer = findAnswer(text);
    const botMsg = { id: `b_${Date.now()}`, role: 'concierge', text: answer };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.ivory }}>
      <ScreenHeader title="Digital Concierge" onBack={() => navigation.goBack()} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.chatArea} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubbleRow, m.role === 'user' && styles.bubbleRowUser]}>
            <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
              <Text style={[styles.bubbleText, m.role === 'user' && { color: colors.white }]}>{m.text}</Text>
            </View>
          </View>
        ))}

        {messages.length === 1 && (
          <View style={styles.suggestedWrap}>
            <Text style={styles.suggestedLabel}>Suggested questions</Text>
            {CONCIERGE_FAQ.map((f) => (
              <TouchableOpacity key={f.question} style={styles.suggestedChip} onPress={() => send(f.question)}>
                <Text style={styles.suggestedText}>{f.question}</Text>
                <Ionicons name="arrow-forward" size={13} color={colors.turquoiseDark} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask the concierge…"
          placeholderTextColor={colors.slate}
          onSubmitEditing={() => send(input)}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send(input)}>
          <Ionicons name="send" size={17} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chatArea: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: radius.lg, padding: spacing.sm, paddingHorizontal: spacing.md },
  bubbleBot: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.deepOcean, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 13.5, color: colors.charcoal, lineHeight: 19 },
  suggestedWrap: { marginTop: spacing.sm, gap: 8 },
  suggestedLabel: { fontSize: 12, fontWeight: '700', color: colors.slate, marginBottom: 4 },
  suggestedChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white,
    borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border,
  },
  suggestedText: { fontSize: 13, color: colors.charcoal, flex: 1, marginRight: 8 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white,
  },
  input: {
    flex: 1, backgroundColor: colors.sandLight, borderRadius: radius.pill,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 13.5, color: colors.charcoal,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.deepOcean, alignItems: 'center', justifyContent: 'center' },
});
