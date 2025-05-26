// ListaEsfihas.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, SafeAreaView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { API_ESFIHAS_URL } from "../../service/config"; // Verifique o caminho e a URL
import { Esfiha } from "../../model/esfiha"; // Importe a interface Esfiha
import Forma from "../../comp/forma";
import ItemDetailModal, { ItemModalData, CarrinhoItem } from "../../comp/itemModel"; // Importe o modal e os tipos
import appStyles from "../../style/appStyles"; // Certifique-se que este caminho está correto
import { useCarrinho } from "../../context/CarrinhoContext";



const ListaEsfihas = () => {
    const router = useRouter();
    const [esfihas, setEsfihas] = useState<Esfiha[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false); // Estado para visibilidade do modal
    const [selectedItem, setSelectedItem] = useState<ItemModalData | null>(null); // Estado para o item selecionado

    const { adicionarAoCarrinho } = useCarrinho();
    

    useEffect(() => {
        fetch(API_ESFIHAS_URL)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // **Crucial:** Adiciona a propriedade 'itemType' a cada objeto esfiha
                const esfihasComTipo: Esfiha[] = data.map((esfiha: any) => ({
                    ...esfiha,
                    itemType: 'esfiha' as 'esfiha' // Assegura o tipo literal 'esfiha'
                }));
                setEsfihas(esfihasComTipo);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao buscar esfihas:", err);
                Alert.alert("Erro", "Não foi possível carregar as esfihas. Tente novamente mais tarde.");
                setLoading(false);
            });
    }, []);

    // Função para abrir o modal com o item selecionado
    const handleOpenModal = (item: ItemModalData) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedItem(null); // Limpa o item selecionado
    };

    // Função para adicionar o item ao carrinho
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
                <Text style={appStyles.title}>🥟 Esfihas mais vendidas</Text>
                <FlatList
                    horizontal
                    contentContainerStyle={appStyles.gridContainer2}
                    showsHorizontalScrollIndicator={false}
                    data={esfihas.slice(0, 5)} // Limitar a 5 itens na seção de mais vendidas
                    keyExtractor={(item) => `horizontal-esfiha-${item.id.toString()}`} // Key única
                    renderItem={({ item }) => (
                        <Forma
                            nome={item.nome}
                            ingredientes={item.ingredientes} // Para esfihas, ingredientes faz sentido
                            imagem={`http://147.79.82.109:8000${item.imagem}`}
                            preco={item.preco}
                            horizontal={true}
                            onPress={() => handleOpenModal(item)} 
                        />
                    )}
                />
            </View>

            <Text style={appStyles.subTitle}>🥟 Todas as Esfihas</Text>
            <FlatList
                horizontal // ou vertical, dependendo do seu layout
                contentContainerStyle={appStyles.gridContainer2}
                data={esfihas}
                keyExtractor={(item) => `grid-esfiha-${item.id.toString()}`} // Key única
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Forma
                        nome={item.nome}
                        ingredientes={item.ingredientes} // Para esfihas, ingredientes faz sentido
                        imagem={`http://147.79.82.109:8000${item.imagem}`}
                        preco={item.preco}
                        horizontal={true} // Ajuste se seu layout for vertical
                        onPress={() => handleOpenModal(item)}
                    />
                )}
            />

            {/* O Modal Componente */}
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
    // Você pode precisar ajustar ou adicionar mais estilos aqui
    // para 'listContent' ou 'columnWrapper' se os layouts forem diferentes
    // para as listas horizontal e vertical.
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});

export default ListaEsfihas;