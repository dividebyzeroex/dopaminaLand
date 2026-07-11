import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import * as Haptics from 'expo-haptics';
import { useIntentTracker } from '@/hooks/useIntentTracker';
import DopaminaLoading from '@/components/DopaminaLoading';

function ProductCardOferta({ item }: { item: any }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();
  
  // This will automatically track view and dwell time
  useIntentTracker(item.id, item.sale_price, { autoTrackView: false });

  const imageUrl = item.image_url;

  return (
    <TouchableOpacity 
      className="flex-1 m-2 rounded-3xl border border-border bg-card overflow-hidden"
      onPress={() => router.push(`/produto/${item.id}`)}
      activeOpacity={0.9}
    >
      <View className="w-full aspect-square relative bg-surface p-4 items-center justify-center">
        {!imageLoaded && imageUrl && (
          <View className="absolute inset-0 bg-muted/20 animate-pulse rounded-t-3xl" />
        )}
        
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: 12 }} 
            contentFit="cover"
            transition={300}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <Text className="text-6xl z-10">{item.image}</Text>
        )}
        
        <View className="absolute top-2 right-2 bg-pop px-2 py-1 rounded-full z-10">
          <Text className="text-white font-black text-xs">-{item.discount}%</Text>
        </View>
      </View>
      <View className="p-4 items-center">
        <Text className="text-foreground font-black text-center mb-2" numberOfLines={2}>{item.name}</Text>
        <Text className="text-muted line-through text-xs">R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <Text className="text-neon font-black text-xl">R$ {item.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
        <TouchableOpacity 
          className="mt-3 bg-neon w-full py-2 rounded-xl flex-row items-center justify-center shadow-lg"
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
          }}
        >
          <Text className="text-black font-black text-xs uppercase">Adicionar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function OfertasScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 8;
  
  const getMsUntilMidnight = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);
    return Math.max(0, midnight.getTime() - now.getTime());
  };
  
  const [timeLeft, setTimeLeft] = useState(getMsUntilMidnight());
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchOffers = async (currentPage: number) => {
    if (currentPage === 0) setLoading(true);
    else setLoadingMore(true);

    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('discount', 0)
      .order('discount', { ascending: false })
      .order('id', { ascending: true })
      .range(from, to);

    if (data) {
      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (currentPage === 0) {
        setProducts(data);
      } else {
        setProducts(prev => {
          const newItems = data.filter(item => !prev.some(p => p.id === item.id));
          return [...prev, ...newItems];
        });
      }
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchOffers(0);

    const timer = setInterval(() => {
      setTimeLeft(getMsUntilMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const renderItem = ({ item }: { item: any }) => <ProductCardOferta item={item} />;

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOffers(nextPage);
    }
  };

  const renderFooter = () => {
    if (!hasMore) return <View className="h-10" />;
    return (
      <View className="py-6 items-center justify-center">
        <TouchableOpacity 
          className="bg-surface border border-pop/50 px-8 py-3 rounded-xl flex-row items-center justify-center shadow-sm active:scale-95 transition-transform"
          onPress={loadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <DopaminaLoading size="small" />
          ) : (
            <Text className="text-neon font-black text-sm tracking-wide">CARREGAR MAIS DOPAMINA</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-pop font-black text-2xl ml-4">🔥 DELÍRIO</Text>
      </View>

      <View className="p-6 items-center">
        <Text className="text-foreground font-bold text-lg mb-4 text-center">Esses preços vão desaparecer em:</Text>
        <View className="flex-row gap-2">
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(hours).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Horas</Text>
          </View>
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(minutes).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Min</Text>
          </View>
          <View className="bg-surface border border-pop/30 p-4 rounded-xl items-center w-20">
            <Text className="text-pop font-black text-2xl">{String(seconds).padStart(2, '0')}</Text>
            <Text className="text-muted text-[10px] font-bold mt-1 uppercase">Seg</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <DopaminaLoading />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
        />
      )}
    </View>
  );
}
