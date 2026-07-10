import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function DoacaoScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    imageEmoji: '📦',
    price: '',
    discount: '10'
  });

  const handleSubmit = async () => {
    if (!form.name || !form.shortName || !form.price) {
      alert('Preencha os campos obrigatórios!');
      return;
    }
    setLoading(true);

    const priceNum = parseFloat(form.price.replace(',', '.'));
    const discountNum = parseInt(form.discount, 10) || 0;
    const salePrice = priceNum - (priceNum * (discountNum / 100));

    try {
      const { error } = await supabase.from('products').insert([
        {
          name: form.name,
          short_name: form.shortName,
          slug: form.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          image: form.imageEmoji,
          price: priceNum,
          discount: discountNum,
          sale_price: salePrice,
          category: 'doacao',
          description: 'Um item completamente inútil doado por alguém com muito tempo livre.',
          rating: '5.0',
          reviews: Math.floor(Math.random() * 500) + 1
        }
      ]);

      if (error) throw error;
      
      alert('Objeto Inútil cadastrado com sucesso!');
      router.push('/');

    } catch (e: any) {
      alert('Erro: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6">
          <View className="py-4 flex-row items-center border-b border-border mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-foreground text-2xl font-bold">←</Text>
            </TouchableOpacity>
            <Text className="text-white font-black text-xl ml-4">Doação Fictícia</Text>
          </View>

          <Text className="text-muted text-sm mb-8">
            Tem alguma ideia absurda para um produto que não serve para nada? 
            Cadastre aqui e ele será vendido na nossa loja para outras pessoas comprarem com dinheiro imaginário.
          </Text>

          <View className="space-y-4 gap-4">
            <View>
              <Text className="text-foreground font-bold mb-2">Nome do Produto *</Text>
              <TextInput 
                className="bg-surface border border-border rounded-xl p-4 text-white"
                placeholder="Ex: Pedra de Estimação Sem Fio"
                placeholderTextColor="#8b8496"
                value={form.name}
                onChangeText={(t) => setForm({...form, name: t})}
              />
            </View>

            <View>
              <Text className="text-foreground font-bold mb-2">Nome Curto *</Text>
              <TextInput 
                className="bg-surface border border-border rounded-xl p-4 text-white"
                placeholder="Ex: Pedra Pro"
                placeholderTextColor="#8b8496"
                value={form.shortName}
                onChangeText={(t) => setForm({...form, shortName: t})}
              />
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-foreground font-bold mb-2">Emoji da Foto</Text>
                <TextInput 
                  className="bg-surface border border-border rounded-xl p-4 text-white text-center text-2xl"
                  placeholder="🪨"
                  placeholderTextColor="#8b8496"
                  maxLength={2}
                  value={form.imageEmoji}
                  onChangeText={(t) => setForm({...form, imageEmoji: t})}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold mb-2">Desconto Falso (%)</Text>
                <TextInput 
                  className="bg-surface border border-border rounded-xl p-4 text-white"
                  placeholder="10"
                  placeholderTextColor="#8b8496"
                  keyboardType="numeric"
                  value={form.discount}
                  onChangeText={(t) => setForm({...form, discount: t})}
                />
              </View>
            </View>

            <View>
              <Text className="text-foreground font-bold mb-2">Preço Falso (R$) *</Text>
              <TextInput 
                className="bg-surface border border-border rounded-xl p-4 text-white font-mono text-xl"
                placeholder="999.99"
                placeholderTextColor="#8b8496"
                keyboardType="numeric"
                value={form.price}
                onChangeText={(t) => setForm({...form, price: t})}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="mt-8 bg-purple py-4 rounded-2xl items-center shadow-[0_0_15px_rgba(166,74,255,0.4)] mb-10"
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="font-black text-white text-lg">DOAR PRODUTO INÚTIL 🚀</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
