import '../global.css';

import { StatusBar } from 'expo-status-bar';
import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CartProvider } from '@/contexts/CartContext';
import { CartToastProvider } from '@/contexts/CartToastContext';
import { SheetProvider, useSheet } from '@/contexts/SheetContext';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import BottomSheet from '@/components/BottomSheet';
import FloatingTabBar from '@/components/FloatingTabBar';

// Lazy imports of sheet content
import OfertasScreen from './ofertas';
import PerfilScreen from './perfil';
import CartScreen from './cart';

// Remove the TabBarButton helper — replaced by FloatingTabBar component

function AppSheets() {
  const { activeSheet, closeSheet } = useSheet();

  return (
    <>
      <BottomSheet visible={activeSheet === 'ofertas'} onClose={closeSheet}>
        <OfertasScreen />
      </BottomSheet>
      <BottomSheet visible={activeSheet === 'perfil'} onClose={closeSheet}>
        <PerfilScreen />
      </BottomSheet>
      <BottomSheet visible={activeSheet === 'cart'} onClose={closeSheet}>
        <CartScreen />
      </BottomSheet>
    </>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <CartProvider>
      <CartToastProvider>
        <SheetProvider>
          <AnimatedSplashOverlay />
          <Tabs
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' }, // hide default, FloatingTabBar takes over
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🏠</Text> }} />
            <Tabs.Screen name="ofertas" options={{ title: 'Ofertas', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🔥</Text> }} />
            <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>👤</Text> }} />
            <Tabs.Screen name="cart" options={{ title: 'Carrinho', tabBarIcon: ({color}) => <Text style={{color, fontSize: 20}}>🛒</Text> }} />
            <Tabs.Screen name="doacao" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="checkout" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="catalogo" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="produto/[slug]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="explore" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="success/[orderId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="tracking/[orderId]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
            <Tabs.Screen name="+not-found" options={{ href: null, tabBarStyle: { display: 'none' } }} />
          </Tabs>
          <AppSheets />
          <StatusBar style="auto" />
        </SheetProvider>
      </CartToastProvider>
    </CartProvider>
  );
}
