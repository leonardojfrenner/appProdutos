// ListaBebidas.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';
import { API_BEBIDAS_URL } from "../../service/config"; // Verifique o caminho e a URL
import { Bebida } from "../../model/bebida"; // Importe a interface Bebida
import Forma from "../../comp/forma";
import ItemDetailModal, { ItemModalData, CarrinhoItem } from "../../comp/itemModel";
import appStyles from "../../style/appStyles"; // Certifique-se que este caminho está correto
import { useCarrinho } from "../../context/CarrinhoContext"; // Importe o contexto do carrinho

const ListaBebidas = () => {
    const router = useRouter();
    const [bebidas, setBebidas] = useState<Bebida[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemModalData | null>(null);

    const { adicionarAoCarrinho } = useCarrinho();

    useEffect(() => {
        fetch(API_BEBIDAS_URL)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // **Crucial:** Adiciona a propriedade 'tipo' a cada objeto bebida
                const bebidasComTipo: Bebida[] = data.map((bebida: any) => ({
                    ...bebida,
                    tipo: 'bebida' as 'bebida' // Assegura o tipo literal 'bebida'
                }));
                setBebidas(bebidasComTipo);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar bebidas:", err);
                Alert.alert("Erro", "Não foi possível carregar as bebidas. Tente novamente mais tarde.");
                setLoading(false);
            });
    }, []);

    const handleOpenModal = (item: ItemModalData) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedItem(null);
    };

    const handleAddItemToCart = (itemToAdd: CarrinhoItem) => {
        adicionarAoCarrinho(itemToAdd);
        // Implemente sua lógica de carrinho real aqui (ex: use um contexto global)
        Alert.alert("Item Adicionado", `${itemToAdd.nome} foi adicionado ao carrinho!`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={appStyles.sectionContainer}>
                <Text style={appStyles.title}>🥤 Bebidas mais vendidas</Text> 
                <FlatList
                    horizontal
                    contentContainerStyle={appStyles.gridContainer2}
                    showsHorizontalScrollIndicator={false}
                    data={bebidas.slice(0, 5)} 
                    keyExtractor={(item) => `horizontal-bebida-${item.id.toString()}`} 
                    renderItem={({ item }) => (
                        <Forma
                            nome={item.nome}
                            ingredientes={item.descricao} 
                            imagem={`http://147.79.82.109:8000${item.imagem}`}
                            preco={item.preco}
                            horizontal={true}
                            onPress={() => handleOpenModal(item)}
                        />
                    )}
                />
            </View>

            <Text style={appStyles.subTitle}>🥤 Todas as Bebidas</Text>
            <FlatList
                horizontal // ou vertical, dependendo do seu layout
                contentContainerStyle={appStyles.gridContainer2} // Ajuste o estilo
                data={bebidas}
                keyExtractor={(item) => `grid-bebida-${item.id.toString()}`} // Key única
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Forma
                        nome={item.nome}
                        ingredientes={item.descricao} // Use 'descricao' para bebidas
                        imagem={`http://147.79.82.109:8000${item.imagem}`}
                        preco={item.preco}
                        horizontal={true} // Ajuste se seu layout for vertical
                        onPress={() => handleOpenModal(item)}
                    />
                )}
            />

            <ItemDetailModal
                visible={modalVisible}
                item={selectedItem}
                onClose={handleCloseModal}
                onAddItem={handleAddItemToCart}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});

export default ListaBebidas;