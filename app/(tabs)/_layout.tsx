import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { usePedidoInfo } from '../../context/pedidoInfoContext';
import { Alert } from 'react-native';

export default function Layout() {
    const router = useRouter();
    const { limparAtendenteLogado } = usePedidoInfo();

    const handleLogout = () => {
        Alert.alert(
            "Sair",
            "Deseja realmente sair?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Sair",
                    onPress: async () => {
                        await limparAtendenteLogado();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    const handleNovoAtendimento = () => {
        router.push('/novoAtendimento');
    };

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                },
                headerRight: () => (
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <TouchableOpacity
                            onPress={handleNovoAtendimento}
                            style={{ marginRight: 15 }}
                        >
                            <FontAwesome name="plus-circle" size={24} color="#007AFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                        >
                            <FontAwesome name="sign-out" size={24} color="#007AFF" />
                        </TouchableOpacity>
                    </View>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Cardápio',
                    tabBarIcon: ({ color }) => <FontAwesome name="cutlery" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="carrinho"
                options={{
                    title: 'Pedido Atual',
                    tabBarIcon: ({ color }) => <FontAwesome name="shopping-cart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="historicoPendente"
                options={{
                    title: 'Pendentes',
                    tabBarIcon: ({ color }) => <FontAwesome name="clock-o" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="historicoConcluido"
                options={{
                    title: 'Concluídos',
                    tabBarIcon: ({ color }) => <FontAwesome name="check-circle" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}