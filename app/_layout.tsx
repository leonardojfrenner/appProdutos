import {Stack} from "expo-router";
import { useEffect,useState } from "react";
import { initializeDatabase } from '../database/db'; // Importe do novo arquivo 'db.ts'
import { CarrinhoProvider } from '../context/CarrinhoContext';
import { PedidoInfoProvider } from '../context/pedidoInfoContext';
import { View, Text, Alert } from 'react-native';

export default function Layout() {
      
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initializeDatabase();
        setDbInitialized(true);
        console.log("Database initialized successfully at app start.");
      } catch (e) {
        console.error("Failed to initialize database:", e);
        Alert.alert("Erro", "Não foi possível carregar o banco de dados. O aplicativo pode não funcionar corretamente. Tente reiniciar.");
      }
    };

    setupDatabase();
  }, []);

  if (!dbInitialized) {
    // Você pode renderizar uma tela de carregamento ou um indicador aqui
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Carregando banco de dados...</Text>
      </View>
    );
  }


    return (
        <PedidoInfoProvider>
          <CarrinhoProvider>
              <Stack />
          </CarrinhoProvider>
        </PedidoInfoProvider>
    );
    }