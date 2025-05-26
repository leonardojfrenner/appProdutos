import { TouchableOpacity,View,StyleSheet,Text } from "react-native";
import {styles} from "../style/styles";

    export default function Botao(props) {
    return (
        <TouchableOpacity onPress={props.onPress}>
            <View style={props.style || styles.botao}>
                <Text style={styles.textoBotao}>{props.texto}</Text>
            </View>
        </TouchableOpacity>
    )
}