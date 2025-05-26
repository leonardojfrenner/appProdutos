import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interfaces para as informações
export interface AtendenteLogado {
    id: number;
    nome: string;
    n_cracha: string;
}

export interface PedidoInfo {
    mesa: string;
    n_cracha_atendente: string;
    nome_atendente: string;
    quantidadePessoas: number;
}

interface PedidoInfoContextType {
    pedidoAtualInfo: PedidoInfo | null;
    atendenteLogado: AtendenteLogado | null; // Adicionado para armazenar o atendente
    salvarPedidoInfo: (info: PedidoInfo) => Promise<void>;
    limparPedidoInfo: () => Promise<void>;
    carregarAtendenteLogado: () => Promise<void>; // Nova função para carregar atendente
    salvarAtendenteLogado: (atendente: AtendenteLogado) => Promise<void>; // Para usar no login
    limparAtendenteLogado: () => Promise<void>; // Para deslogar

    // Adicione um método para iniciar um novo pedido usando o atendente logado
    iniciarNovoPedidoComAtendente: (mesa: string, quantidadePessoas: number) => Promise<void>;
}

const PedidoInfoContext = createContext<PedidoInfoContextType | undefined>(undefined);

export const PedidoInfoProvider = ({ children }: { children: ReactNode }) => {
    const [pedidoAtualInfo, setPedidoAtualInfo] = useState<PedidoInfo | null>(null);
    const [atendenteLogado, setAtendenteLogado] = useState<AtendenteLogado | null>(null); // Novo estado
    
    const PEDIDO_INFO_KEY = 'pedidoAtualInfo';
    const ATENDENTE_LOGADO_KEY = 'atendente'; // Chave do AsyncStorage para o atendente

    // Carregar informações do pedido atual
    const carregarPedidoInfo = useCallback(async () => {
        try {
            const storedInfo = await AsyncStorage.getItem(PEDIDO_INFO_KEY);
            if (storedInfo) {
                const parsedInfo: PedidoInfo = JSON.parse(storedInfo);
                setPedidoAtualInfo(parsedInfo);
                console.log('Informações do Pedido carregadas do Storage:', parsedInfo);
            } else {
                setPedidoAtualInfo(null);
                console.log('Nenhuma informação de pedido encontrada no Storage.');
            }
        } catch (error) {
            console.error('Erro ao carregar informações do pedido do Storage:', error);
            setPedidoAtualInfo(null);
        }
    }, []);

    // Carregar informações do atendente logado
    const carregarAtendenteLogado = useCallback(async () => {
        try {
            const storedAtendente = await AsyncStorage.getItem(ATENDENTE_LOGADO_KEY);
            if (storedAtendente) {
                const parsedAtendente: AtendenteLogado = JSON.parse(storedAtendente);
                setAtendenteLogado(parsedAtendente);
                console.log('Atendente logado carregado do Storage:', parsedAtendente);
            } else {
                setAtendenteLogado(null);
                console.log('Nenhum atendente logado encontrado no Storage.');
            }
        } catch (error) {
            console.error('Erro ao carregar atendente logado do Storage:', error);
            setAtendenteLogado(null);
        }
    }, []);

    // Salvar informações do atendente logado
    const salvarAtendenteLogado = useCallback(async (atendente: AtendenteLogado) => {
        try {
            await AsyncStorage.setItem(ATENDENTE_LOGADO_KEY, JSON.stringify(atendente));
            setAtendenteLogado(atendente); // Atualiza o estado do contexto imediatamente
            console.log('Atendente logado SALVO no Storage:', atendente);
        } catch (error) {
            console.error('Erro ao salvar atendente logado no Storage:', error);
            Alert.alert('Erro', 'Não foi possível salvar as informações do atendente.');
        }
    }, []);

    // Limpar informações do atendente logado
    const limparAtendenteLogado = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(ATENDENTE_LOGADO_KEY);
            setAtendenteLogado(null);
            console.log('Informações do atendente logado REMOVIDAS do Storage.');
        } catch (error) {
            console.error('Erro ao remover atendente logado do Storage:', error);
            Alert.alert('Erro', 'Não foi possível limpar as informações do atendente.');
        }
    }, []);

    // Salvar informações do pedido
    const salvarPedidoInfo = useCallback(async (info: PedidoInfo) => {
        try {
            await AsyncStorage.setItem(PEDIDO_INFO_KEY, JSON.stringify(info));
            setPedidoAtualInfo(info);
            console.log('Informações do Pedido SALVAS no Storage:', info);
        } catch (error) {
            console.error('Erro ao salvar informações do pedido no Storage:', error);
            Alert.alert('Erro', 'Não foi possível salvar as informações do pedido.');
        }
    }, []);

    // Limpar informações do pedido
    const limparPedidoInfo = useCallback(async () => {
        try {
            await AsyncStorage.removeItem(PEDIDO_INFO_KEY);
            setPedidoAtualInfo(null);
            console.log('Informações do Pedido REMOVIDAS do Storage.');
        } catch (error) {
            console.error('Erro ao remover informações do pedido do Storage:', error);
            Alert.alert('Erro', 'Não foi possível limpar as informações do pedido.');
        }
    }, []);

    // Nova função para iniciar um novo pedido usando o atendente logado
    const iniciarNovoPedidoComAtendente = useCallback(async (mesa: string, quantidadePessoas: number) => {
        if (!atendenteLogado) {
            Alert.alert("Erro", "Nenhum atendente logado. Faça o login primeiro.");
            return;
        }

        const novaPedidoInfo: PedidoInfo = {
            mesa: mesa,
            quantidadePessoas: quantidadePessoas,
            n_cracha_atendente: atendenteLogado.n_cracha,
            nome_atendente: atendenteLogado.nome,
        };
        await salvarPedidoInfo(novaPedidoInfo); // Salva no AsyncStorage e atualiza o estado
        console.log("Novo pedido iniciado e informações salvas:", novaPedidoInfo);
    }, [atendenteLogado, salvarPedidoInfo]); // Depende de atendenteLogado e salvarPedidoInfo

    // Carrega atendente e pedido ao montar o Provider
    useEffect(() => {
        carregarAtendenteLogado();
        carregarPedidoInfo();
    }, [carregarAtendenteLogado, carregarPedidoInfo]); // Carrega ambos na montagem

    return (
        <PedidoInfoContext.Provider value={{
            pedidoAtualInfo,
            atendenteLogado, // Exponha o atendente logado
            salvarPedidoInfo,
            limparPedidoInfo,
            carregarAtendenteLogado,
            salvarAtendenteLogado,
            limparAtendenteLogado,
            iniciarNovoPedidoComAtendente // Exponha a nova função
        }}>
            {children}
        </PedidoInfoContext.Provider>
    );
};

export const usePedidoInfo = () => {
    const context = useContext(PedidoInfoContext);
    if (context === undefined) {
        throw new Error('usePedidoInfo deve ser usado dentro de um PedidoInfoProvider');
    }
    return context;
};