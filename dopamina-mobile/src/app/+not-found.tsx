import { Link, Stack } from 'expo-router';
import { View, Text, Image, SafeAreaView } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        
        <View className="relative w-48 h-48 mb-8 border-4 border-neon rounded-full overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.3)]">
          <Image 
            source={{ uri: 'https://raw.githubusercontent.com/dividebyzeroex/dopaminaLand/main/dopamina-brasil/public/cleiton_nobg.png' }} 
            className="w-full h-full bg-surface"
            resizeMode="cover"
          />
        </View>

        <Text className="text-6xl font-black text-white mb-2">404</Text>
        <Text className="text-xl font-bold text-neon mb-4">Cleiton se perdeu!</Text>
        <Text className="text-muted text-center mb-10 leading-6">
          A página que você procurava não existe. Ou talvez ela exista, mas o Cleiton entregou no endereço errado. Acontece.
        </Text>

        <Link href="/" className="bg-neon px-8 py-4 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.4)]">
          <Text className="font-black text-background text-lg">VOLTAR PARA A HOME</Text>
        </Link>
      </SafeAreaView>
    </>
  );
}
