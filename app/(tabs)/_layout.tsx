import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#e91e63",
                tabBarInactiveTintColor: "#000",
                tabBarStyle: {
                    backgroundColor: "#fff",
                    borderTopWidth: 0,
                    elevation: 0,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Início",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="carrinho"
                options={{
                    title: "Pedidos",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="list" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}