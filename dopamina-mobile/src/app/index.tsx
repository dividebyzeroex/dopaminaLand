import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, FlatList, ScrollView, Dimensions, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import { useCart } from '@/contexts/CartContext';
import { useIntentTracker } from '@/hooks/useIntentTracker';
import { useCartToast } from '@/contexts/CartToastContext';
import { useSheet } from '@/contexts/SheetContext';
import DopaminaLoading from '@/components/DopaminaLoading';

const { width } = Dimensions.get('window');

const trustBadges = [
  { emoji: '🧾', title: 'Dopamina Real', desc: 'Sem faturas' },
  { emoji: '🛵', title: 'Motoboys Reais', desc: 'Ou quase isso' },
  { emoji: '⚡', title: '1-Clique', desc: 'Muito rápido' },
  { emoji: '📍', title: 'Rastreamento', desc: 'Siga no mapa' },
];

const infiniteBadges = [...trustBadges, ...trustBadges, ...trustBadges, ...trustBadges, ...trustBadges];

function ProductCard({ item, widthOverride }: { item: any, widthOverride?: number }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { trackAddToCart } = useIntentTracker(item.id, item.sale_price, { autoTrackView: false });
  const { showCartToast } = useCartToast();

  const imageUrl = item.image_url;

  return (
    <TouchableOpacity 
      style={{ width: widthOverride || (width / 2) - 24, margin: 8 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
      onPress={() => router.push(`/produto/${item.id}`)}
      activeOpacity={0.9}
    >
      <View className="w-full aspect-square relative bg-surface p-4 items-center justify-center">
        {!imageLoaded && imageUrl && (
          <View className="absolute inset-0 bg-muted/20 animate-pulse rounded-t-2xl" />
        )}

        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 12 }} 
            contentFit="cover"
            transition={300}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <Text className="text-6xl">{item.image}</Text>
        )}
        
        {item.discount > 0 && (
          <View style={{ position: 'absolute', left: 8, top: 8, zIndex: 10, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(245,158,11,0.92)', paddingVertical: 3, paddingHorizontal: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>-{item.discount}%</Text>
          </View>
        )}
      </View>
      <View className="p-3">
        <Text className="text-foreground font-bold text-sm mb-1 truncate" numberOfLines={2}>{item.short_name || item.name}</Text>
        <Text className="text-muted text-xs line-through">R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <Text className="text-neon font-black text-lg">R$ {item.sale_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <Text className="text-muted text-[10px] mb-3">ou 4x sem juros</Text>
        
        <TouchableOpacity 
          className="bg-neon w-full py-2 rounded-xl flex-row items-center justify-center shadow-lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            addItem({
              id: item.id,
              slug: item.slug,
              name: item.name,
              shortName: item.short_name,
              image: item.image,
              localImage: item.image_url,
              originalPrice: item.price,
              salePrice: item.sale_price,
            });
            trackAddToCart();
            showCartToast();
          }}
        >
          <Text className="text-background font-black text-xs mr-1">COMPRAR</Text>
          <Text className="text-xs">⚡</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setTabBarVisible } = useSheet();
  const lastScrollY = useRef(0);

  const handleScroll = useCallback((e: any) => {
    const currentY = e.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;
    if (diff > 12 && currentY > 60) {
      setTabBarVisible(false);
    } else if (diff < -8) {
      setTabBarVisible(true);
    }
    lastScrollY.current = currentY;
  }, []);
  const marqueeX = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();

  useEffect(() => {
    // 4 items * 172px width = 688px per cycle
    Animated.loop(
      Animated.timing(marqueeX, {
        toValue: -688,
        duration: 12000, // Speed of marquee
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, flashRes] = await Promise.all([
          supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12),
          supabase.from('products').select('*').gte('discount', 12).order('discount', { ascending: false }).limit(8)
        ]);

        setProducts(productsRes.data || []);
        setFlashDeals(flashRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const renderHeader = () => (
    <View>
      {/* Header Search & Title */}
      <View className="px-4 py-2 bg-background shadow-sm z-10 border-b border-border">
        <Text className="text-foreground font-black text-3xl text-center mb-4 tracking-tighter">
          Dopaminado<Text className="text-neon">.</Text>
        </Text>
        <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 mb-2">
          <Text className="text-muted text-lg mr-2">🔍</Text>
          <TextInput 
            placeholder="Buscar produtos imaginários..."
            className="flex-1 text-foreground"
            placeholderTextColor="#a1a1aa"
          />
        </View>
      </View>

      {/* HERO BANNER */}
      <View className="m-4 bg-gradient-to-br from-surface via-surface-light to-[#ffedd5] rounded-3xl overflow-hidden border border-border relative">
        <View className="p-6">
          <View className="bg-neon/10 self-start px-3 py-1 rounded-full border border-neon/30 mb-4">
            <Text className="text-neon text-[10px] font-black uppercase">✦ consumismo simulado</Text>
          </View>
          <Text className="text-foreground font-black text-3xl mb-1 tracking-tighter">escolha. <Text className="text-neon">clique</Text>.</Text>
          <Text className="text-foreground font-black text-3xl mb-4 tracking-tighter">o cleiton <Text className="text-neon">entrega</Text>.</Text>
          
          <TouchableOpacity 
            className="bg-neon py-2 px-5 rounded-full self-start shadow-lg"
            onPress={() => router.push('/ofertas')}
          >
            <Text className="text-white font-extrabold text-xs">minha dopamina 🚀</Text>
          </TouchableOpacity>
        </View>
        <View className="absolute bottom-[-10] right-[-20] w-40 h-40 opacity-80">
          <Image source={require('@/assets/images/cleiton_nobg.png')} style={{width: '100%', height: '100%'}} contentFit="contain" />
        </View>
      </View>

      {/* COUPON BLOCK */}
      <View className="mx-4 mb-4 bg-[#160c20] rounded-3xl p-6 border border-border flex-row items-center justify-between overflow-hidden">
        <View className="flex-1">
          <View className="bg-pop/10 self-start px-2 py-1 rounded-full border border-pop/40 mb-2">
            <Text className="text-pop text-[10px] font-black uppercase">✦ hackeando o sistema</Text>
          </View>
          <Text className="text-white font-black text-xl tracking-tighter">Código VIP</Text>
          <TouchableOpacity className="mt-2 bg-white/5 border border-dashed border-pop/50 py-1.5 px-3 rounded-xl self-start flex-row items-center"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              alert('Copiado!');
            }}
          >
            <Text className="text-pop font-extrabold text-xs mr-2">DOPAMINADO</Text>
            <View className="bg-pop px-2 py-1 rounded-md"><Text className="text-background text-[10px] font-black">copiar</Text></View>
          </TouchableOpacity>
        </View>
        <View className="items-center justify-center">
          <Text className="text-background font-black text-4xl drop-shadow-[0_0_15px_rgba(255,210,74,0.8)]" style={{textShadowColor: '#f59e0b', textShadowRadius: 10}}>25%</Text>
        </View>
      </View>

      {/* TRUST BADGES (SMOOTH MARQUEE) */}
      <View className="mb-8 overflow-hidden">
        <Animated.View 
          className="flex-row items-center"
          style={{ transform: [{ translateX: marqueeX }] }}
        >
          {infiniteBadges.map((badge, i) => (
            <View key={i} className="ml-4 bg-card border border-border rounded-2xl p-4 w-40">
              <Text className="text-2xl mb-2">{badge.emoji}</Text>
              <Text className="text-foreground font-extrabold text-sm mb-1">{badge.title}</Text>
              <Text className="text-muted text-xs">{badge.desc}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      {/* FLASH DEALS (OFERTAS RELÂMPAGO) */}
      <View className="mb-8 bg-surface-lighter py-6 border-y border-border">
        <View className="flex-row justify-between items-end px-4 mb-4">
          <Text className="text-foreground font-black text-2xl">🔥 ofertas relâmpago</Text>
          <TouchableOpacity onPress={() => router.push('/ofertas')}>
            <Text className="text-neon font-bold text-xs">ver todas →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {flashDeals.map((item) => (
            <ProductCard key={item.id} item={item} widthOverride={160} />
          ))}
        </ScrollView>
      </View>

      {/* CATÁLOGO COMPLETO TITLE */}
      <View className="px-4 mb-2 flex-row justify-between items-end">
        <View className="flex-1 mr-4">
          <Text className="text-foreground font-black text-2xl">catálogo completo ⚡</Text>
          <Text className="text-muted text-xs mt-1" numberOfLines={1}>muitos produtos fictícios para você</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/catalogo')}>
          <Text className="text-neon font-bold text-xs pb-1">ver todos →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {loading ? (
        <DopaminaLoading />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <ProductCard item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      )}
    </View>
  );
}
