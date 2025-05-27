// context/CarrinhoContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CarrinhoItem } from '../comp/itemModel';
import { insertPedido, getPedidosPendentesFromDB, updatePedidoStatusAndEndTime } from '../database/crud'; // Certifique-se que o caminho está correto

// Tipos para os dados do pedido completo que será salvo no histórico
export interface PedidoCompleto {
    id: string; // Adicionar um ID único para cada pedido finalizado
    mesa: string;
    n_cracha_atendente: string;
    nome_atendente: string;
    quantidadePessoas: number;
    itens: CarrinhoItem[];
    valorTotal: number;
    dataHora: string;
    status: 'pendente' | 'em preparo' | 'entregue' | 'cancelado'; // Possíveis status
}

// Definindo o tipo para o contexto do carrinho
interface CarrinhoContextType {
    carrinho: CarrinhoItem[];
    pedidosPendentes: PedidoCompleto[];
    adicionarAoCarrinho: (item: CarrinhoItem) => void;
    removerDoCarrinho: (itemId: number, itemType: 'pizza' | 'esfiha' | 'bebida') => void;
    atualizarQuantidade: (itemId: number, itemType: 'pizza' | 'esfiha' | 'bebida', novaQuantidade: number) => void;
    limparCarrinho: () => void;
    getTotalItens: () => number;
    getPrecoTotal: () => number;
    finalizarPedido: (
        dadosIniciaisPedido: Omit<PedidoCompleto, 'id' | 'valorTotal' | 'dataHora' | 'status' | 'itens'>
    ) => Promise<boolean>;
    marcarPedidoComoEntregue: (pedidoId: string) => void;
    carregarPedidosPendentes: () => Promise<void>; // <-- MANTENHA ISSO NA INTERFACE
}

// Criando o contexto com valores padrão
const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

// Chaves para armazenar no AsyncStorage
const CARRINHO_STORAGE_KEY = '@appPedido:carrinho';
const PEDIDOS_PENDENTES_STORAGE_KEY = '@appPedido:pedidosPendentes';

interface CarrinhoProviderProps {
    children: ReactNode;
}

export const CarrinhoProvider: React.FC<CarrinhoProviderProps> = ({ children }) => {
    const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
    const [pedidosPendentes, setPedidosPendentes] = useState<PedidoCompleto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Função para carregar pedidos pendentes do SQLite para o estado do contexto
    const carregarPedidosPendentesDoDB = async () => {
        if (isLoading) return; // Evita múltiplas chamadas simultâneas
        
        try {
            setIsLoading(true);
            const pedidos = await getPedidosPendentesFromDB();
            setPedidosPendentes(pedidos);
        } catch (error) {
            console.error("Erro ao carregar pedidos pendentes do DB:", error);
            Alert.alert("Erro", "Não foi possível carregar os pedidos pendentes.");
        } finally {
            setIsLoading(false);
        }
    };

    // Carregar carrinho e pedidos pendentes ao iniciar
    useEffect(() => {
        const carregarDados = async () => {
            try {
                const carrinhoString = await AsyncStorage.getItem(CARRINHO_STORAGE_KEY);
                if (carrinhoString) {
                    setCarrinho(JSON.parse(carrinhoString));
                }
                await carregarPedidosPendentesDoDB();
            } catch (e) {
                console.error("Erro ao carregar dados:", e);
                Alert.alert("Erro", "Não foi possível carregar os dados salvos.");
            }
        };
        carregarDados();
    }, []);

    // Salvar o carrinho no AsyncStorage sempre que ele mudar
    useEffect(() => {
        const salvarCarrinho = async () => {
            try {
                await AsyncStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(carrinho));
            } catch (e) {
                console.error("Erro ao salvar carrinho:", e);
            }
        };
        salvarCarrinho();
    }, [carrinho]);

    const adicionarAoCarrinho = (item: CarrinhoItem) => {
        setCarrinho(prevCarrinho => {
            const itemExistenteIndex = prevCarrinho.findIndex(
                (cItem) =>
                    cItem.id === item.id &&
                    cItem.tipo === item.tipo &&
                    cItem.observacao === item.observacao &&
                    (item.tipo === 'pizza' ? cItem.bordaRecheada === item.bordaRecheada : true) &&
                    (item.tipo === 'bebida' ? JSON.stringify(cItem.adicionaisSelecionados) === JSON.stringify(item.adicionaisSelecionados) : true)
            );

            if (itemExistenteIndex > -1) {
                const novoCarrinho = [...prevCarrinho];
                novoCarrinho[itemExistenteIndex].quantidade += item.quantidade;
                return novoCarrinho;
            } else {
                return [...prevCarrinho, item];
            }
        });
    };

    const removerDoCarrinho = (itemId: number, itemType: 'pizza' | 'esfiha' | 'bebida') => {
        setCarrinho(prevCarrinho => prevCarrinho.filter(
            (item) => !(item.id === itemId && item.tipo === itemType)
        ));
    };

    const atualizarQuantidade = (itemId: number, itemType: 'pizza' | 'esfiha' | 'bebida', novaQuantidade: number) => {
        if (novaQuantidade < 1) return;
        
        setCarrinho(prevCarrinho =>
            prevCarrinho.map(item =>
                (item.id === itemId && item.tipo === itemType)
                    ? { ...item, quantidade: novaQuantidade }
                    : item
            )
        );
    };

    const limparCarrinho = () => {
        setCarrinho([]);
    };

    const getTotalItens = () => {
        return carrinho.reduce((total, item) => total + item.quantidade, 0);
    };

    const getPrecoTotal = () => {
        return carrinho.reduce((total, item) => {
            const precoItem = item.precoUnitario * item.quantidade;
            return total + precoItem;
        }, 0);
    };

    const finalizarPedido = async (dadosIniciaisPedido: Omit<PedidoCompleto, 'id' | 'valorTotal' | 'dataHora' | 'status' | 'itens'>): Promise<boolean> => {
        if (carrinho.length === 0) {
            Alert.alert("Erro", "Não é possível finalizar um carrinho vazio.");
            return false;
        }

        const novoPedidoId = Date.now().toString();
        const novoPedido: PedidoCompleto = {
            id: novoPedidoId,
            ...dadosIniciaisPedido,
            itens: [...carrinho],
            valorTotal: getPrecoTotal(),
            dataHora: new Date().toISOString(),
            status: 'pendente',
        };

        try {
            await insertPedido(novoPedido);
            await carregarPedidosPendentesDoDB();
            limparCarrinho();
            return true;
        } catch (e) {
            console.error("Erro ao finalizar pedido:", e);
            Alert.alert("Erro", "Não foi possível finalizar o pedido.");
            return false;
        }
    };

    const marcarPedidoComoEntregue = async (pedidoId: string) => {
        try {
            const dataHoraFim = new Date().toISOString();
            await updatePedidoStatusAndEndTime(pedidoId, 'entregue', dataHoraFim);
            await carregarPedidosPendentesDoDB();
        } catch (error) {
            console.error("Erro ao marcar pedido como entregue:", error);
            Alert.alert("Erro", "Não foi possível marcar o pedido como entregue.");
        }
    };

    return (
        <CarrinhoContext.Provider
            value={{
                carrinho,
                pedidosPendentes,
                adicionarAoCarrinho,
                removerDoCarrinho,
                atualizarQuantidade,
                limparCarrinho,
                getTotalItens,
                getPrecoTotal,
                finalizarPedido,
                marcarPedidoComoEntregue,
                carregarPedidosPendentes: carregarPedidosPendentesDoDB,
            }}
        >
            {children}
        </CarrinhoContext.Provider>
    );
};

export const useCarrinho = () => {
    const context = useContext(CarrinhoContext);
    if (context === undefined) {
        throw new Error('useCarrinho must be used within a CarrinhoProvider');
    }
    return context;
};