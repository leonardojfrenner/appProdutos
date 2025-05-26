// comp/Forma.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import appStyles from "../style/appStyles";

interface FormaProps {
    nome: string;
    ingredientes: string;
    imagem: string;
    preco?: string;
    onPress?: () => void;
    horizontal?: boolean;
}

export default function Forma({ nome, ingredientes, imagem, preco, onPress, horizontal = false }: FormaProps) {
    return (
        <View style={horizontal ? appStyles.formaContainerHorizontal : appStyles.formaContainer}>
            <TouchableOpacity style={appStyles.touchableContainer} onPress={onPress}>
                <Image source={{ uri: imagem }} style={appStyles.forma} />
                <Text style={appStyles.textoCard} numberOfLines={1}>{nome}</Text>
                <Text style={appStyles.ingredientesText} numberOfLines={3}>{ingredientes}</Text>
                {preco && <Text style={appStyles.precoText}>R$ {preco}</Text>}
            </TouchableOpacity>
        </View>
    );
}
