import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { useIntentTracker } from '@/hooks/useIntentTracker';
import { useCartToast } from '@/contexts/CartToastContext';
import DopaminaLoading from '@/components/DopaminaLoading';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'todos', label: 'Todos', emoji: '🔥' },
  { id: 'games', label: 'Games', emoji: '🎮' },
  { id: 'tecnologia', label: 'Tecnologia', emoji: '📱' },
  { id: 'beleza', label: 'Beleza', emoji: '💄' },
  { id: 'moda', label: 'Moda', emoji: '👟' },
  { id: 'casa', label: 'Casa', emoji: '🛋️' },
];

function ProductCardCatalogo({ item }: { item: any }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { trackAddToCart } = useIntentTracker(item.id, item.sale_price, { autoTrackView: false });
  const { showCartToast } = useCartToast();

  const imageUrl = item.image_url;

  return (
    <TouchableOpacity 
      style={{ width: (width / 2) - 24, margin: 8 }}
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
          <View className="absolute left-2 top-2 bg-pop px-2 py-1 rounded-full z-10">
            <Text className="text-white text-xs font-black">-{item.discount}%</Text>
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

export default function CatalogoScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('recentes'); // recentes | menor_preco | maior_preco
  const ITEMS_PER_PAGE = 12;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchProducts = async (currentPage: number, category: string) => {
    if (currentPage === 0) setLoading(true);
    else setLoadingMore(true);

    const from = currentPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from('products')
      .select('*')
      .range(from, to);
      
    if (sortBy === 'menor_preco') {
      query = query.order('sale_price', { ascending: true });
    } else if (sortBy === 'maior_preco') {
      query = query.order('sale_price', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // Always tie-break with id
    query = query.order('id', { ascending: true });

    if (category !== 'todos') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

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
    fetchProducts(0, activeCategory);
  }, [activeCategory, sortBy]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, activeCategory);
    }
  };

  const handleCategoryPress = (catId: string) => {
    if (activeCategory === catId) return;
    setActiveCategory(catId);
    setPage(0);
    setProducts([]);
  };

  const handleSortPress = (sortId: string) => {
    if (sortBy === sortId) return;
    setSortBy(sortId);
    setPage(0);
    setProducts([]);
  };

  const renderFooter = () => {
    if (!hasMore && products.length > 0) return <View className="h-10" />;
    if (!hasMore) return null;
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
            <Text className="text-neon font-black text-sm tracking-wide">CARREGAR MAIS</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="mb-4">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          const isActive = activeCategory === item.id;
          return (
            <TouchableOpacity
              onPress={() => handleCategoryPress(item.id)}
              className={`mr-3 flex-row items-center px-4 py-3 rounded-2xl border ${
                isActive ? 'bg-neon border-neon' : 'bg-surface border-border'
              }`}
            >
              <Text className="text-xl mr-2">{item.emoji}</Text>
              <Text className={`${isActive ? 'text-white' : 'text-foreground'} font-extrabold`}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
      
      {/* Sorting Pills */}
      <View className="px-4 mt-4 flex-row items-center gap-2">
        <Text className="text-muted text-xs font-bold mr-1">Ordenar por:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'recentes', label: 'Mais novos' },
            { id: 'menor_preco', label: 'Menor Preço' },
            { id: 'maior_preco', label: 'Maior Preço' },
          ].map(s => (
            <TouchableOpacity 
              key={s.id}
              onPress={() => handleSortPress(s.id)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${
                sortBy === s.id ? 'bg-pop/10 border-pop' : 'bg-transparent border-border'
              }`}
            >
              <Text className={`text-xs font-bold ${sortBy === s.id ? 'text-pop' : 'text-muted'}`}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-border bg-background">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-foreground text-2xl font-bold">←</Text>
        </TouchableOpacity>
        <Text className="text-foreground font-black text-2xl ml-4">catálogo completo ⚡</Text>
      </View>

      <View className="flex-1 pt-4">
        {loading && page === 0 ? (
          <DopaminaLoading />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => <ProductCardCatalogo item={item} />}
            ListFooterComponent={renderFooter}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 8 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
