import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const leaderboard = [
  { rank: 1, name: 'Chuck Norris', orders: 999, dopamine: 149850 },
  { rank: 2, name: 'Elon M.', orders: 300, dopamine: 42500 },
  { rank: 3, name: 'John Wick', orders: 150, dopamine: 22000 },
  { rank: 4, name: 'MC Xamã', orders: 100, dopamine: 14000 },
  { rank: 5, name: 'Tia do Zap', orders: 66, dopamine: 9600 },
];

const achievements = [
  { id: 'first_blood', icon: '🩸', title: 'Primeiro Sangue', description: 'Fez sua primeira compra inútil', xpReward: 100, unlocked: true },
  { id: 'money_burner', icon: '🔥', title: 'Queima de Estoque', description: 'Gastou R$ 10.000 (de mentira)', xpReward: 500, unlocked: true },
  { id: 'cart_hoarder', icon: '🛒', title: 'Acumulador', description: 'Colocou 10 itens no carrinho', xpReward: 300, unlocked: false },
  { id: 'cleiton_fan', icon: '🐶', title: 'Fã do Cleiton', description: 'Clicou no easter egg do Cleiton', xpReward: 1000, unlocked: false },
];

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [inputName, setInputName] = useState('Anônimo');
  const [inputEmail, setInputEmail] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const purchaseCount = 12;
  const delivered = 12;
  const lost = 0;
  const totalSpent = 4320.50;
  const kmTraveled = purchaseCount * 850;
  const xp = 1540;
  const level = 4;
  const levelEmoji = '🚀';
  const levelTitle = 'Viajante Intergalático';
  const xpProgress = 65;

  const handleSaveProfile = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border bg-background z-10 shadow-sm">
        <Text className="text-foreground font-black text-3xl tracking-tighter">
          Minha conta ⚡
        </Text>
        <Text className="text-muted font-medium text-sm mt-1">
          Seu histórico de pedidos puramente dopaminérgico
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          {/* Profile Creation Section */}
          <View className="bg-surface border border-border rounded-3xl p-6 shadow-sm mb-8">
            <Text className="text-foreground font-black text-xl mb-2">
              Crie um perfil para ver tudo em qualquer lugar
            </Text>
            <Text className="text-muted text-xs font-medium mb-4">
              Sem senhas — apenas nome e email. Seus pedidos acompanham você.
            </Text>
            
            <View className="gap-3">
              <TextInput 
                className="bg-background border border-border rounded-xl px-4 py-4 text-foreground font-medium"
                placeholder="Seu nome"
                placeholderTextColor="#8b8496"
                value={inputName}
                onChangeText={setInputName}
              />
              <TextInput 
                className="bg-background border border-border rounded-xl px-4 py-4 text-foreground font-medium"
                placeholder="Seu e-mail"
                placeholderTextColor="#8b8496"
                keyboardType="email-address"
                value={inputEmail}
                onChangeText={setInputEmail}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                className="bg-neon rounded-xl px-6 py-4 items-center justify-center shadow-lg mt-2"
                onPress={handleSaveProfile}
              >
                <Text className="text-background font-black text-base">
                  {isSaved ? 'Salvo! ✓' : 'Entrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Level XP Bar */}
          <View className="bg-[#2a1a3a] rounded-3xl p-6 shadow-xl mb-8 overflow-hidden">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center shadow-inner mr-4">
                  <Text className="text-3xl">{levelEmoji}</Text>
                </View>
                <View className="flex-1">
                  <View className="bg-neon self-start px-2 py-0.5 rounded-full mb-1">
                    <Text className="text-background font-black text-[10px] uppercase">Level {level}</Text>
                  </View>
                  <Text className="text-white font-black text-xl tracking-tight" numberOfLines={1}>{levelTitle}</Text>
                </View>
              </View>
              <Text className="text-white/60 font-bold text-sm ml-2">{xp} ⚡</Text>
            </View>
            
            <View className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
              <View 
                className="h-full bg-neon rounded-full" 
                style={{ width: `${xpProgress}%` }} 
              />
            </View>
            <Text className="text-white/50 text-[10px] font-medium text-center">
              460 ⚡ restantes para: Mestre da Ilusão
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between mb-8 gap-y-4">
            <View className="w-[48%] bg-card border border-border rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl mb-2">🛒</Text>
              <Text className="text-foreground font-black text-3xl">{purchaseCount}</Text>
              <Text className="text-muted font-bold text-[10px] uppercase tracking-wider mt-1">Pedidos Feitos</Text>
            </View>
            <View className="w-[48%] bg-card border border-border rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl mb-2">🎉</Text>
              <Text className="text-emerald-500 font-black text-3xl">{delivered}</Text>
              <Text className="text-muted font-bold text-[10px] uppercase tracking-wider mt-1">Entregues</Text>
            </View>
            
            <View className="w-[48%] bg-card border border-border rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl mb-2">💸</Text>
              <Text className="text-neon font-black text-2xl">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
              <Text className="text-muted font-bold text-[10px] uppercase tracking-wider mt-1">Total Economizado</Text>
              <Text className="text-muted text-[8px] mt-1">que você NÃO gastou</Text>
            </View>
            <View className="w-[48%] bg-card border border-border rounded-2xl p-4 shadow-sm">
              <Text className="text-2xl mb-2">⚡</Text>
              <Text className="text-purple-600 font-black text-3xl">{xp}</Text>
              <Text className="text-muted font-bold text-[10px] uppercase tracking-wider mt-1">Dopamina Ganha</Text>
            </View>
          </View>

          {/* Achievements Grid */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground font-black text-lg uppercase tracking-wide">
                🏅 Conquistas
              </Text>
              <Text className="text-muted font-bold text-xs">2/4 desbloqueadas</Text>
            </View>
            
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {achievements.map((ach) => (
                <View 
                  key={ach.id} 
                  className={`w-[48%] p-4 rounded-2xl border items-center text-center ${
                    ach.unlocked ? 'border-border bg-purple-500/10 shadow-sm' : 'border-transparent bg-surface opacity-60'
                  }`}
                >
                  <View className="absolute right-2 top-2">
                    <Text className="text-[10px]">{ach.unlocked ? '✔️' : '🔒'}</Text>
                  </View>
                  <Text className="text-3xl mb-2">{ach.icon}</Text>
                  <Text className="text-foreground font-bold text-sm text-center mb-1">{ach.title}</Text>
                  <Text className="text-muted text-[10px] text-center mb-2">{ach.description}</Text>
                  {ach.unlocked && (
                    <View className="bg-neon/10 px-2 py-1 rounded-full">
                      <Text className="text-neon font-black text-[10px]">+{ach.xpReward} ⚡</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Leaderboard */}
          <View className="bg-surface border border-border rounded-3xl p-6 shadow-sm mb-12">
            <Text className="text-foreground font-black text-lg uppercase tracking-wide mb-4">
              🏆 Leaderboard
            </Text>
            
            <View className="gap-2">
              {leaderboard.map((user) => (
                <View key={user.rank} className="bg-background border border-border rounded-2xl px-4 py-3 shadow-sm flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-muted font-black w-8 text-center">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                    </Text>
                    <Text className="text-foreground font-bold ml-2">{user.name}</Text>
                  </View>
                  <Text className="text-purple-600 font-black text-sm">{user.dopamine.toLocaleString('pt-BR')} ⚡</Text>
                </View>
              ))}
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
