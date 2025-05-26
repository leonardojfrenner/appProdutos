import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 20,
    },
    header: {
        backgroundColor: "#f8f8f8",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    image:{
        width: 100,
        height: 100,
        borderRadius: 10,

    },
    botao: {
        alignSelf: "center",
        height: 50,
        width: 200,
        backgroundColor: "#ADD8E6", 
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },
    textoBotao: {
        color: "black",
        fontSize: 20,
    },
    
    input: {
        alignSelf: "center",
        height: 50,
        width: 200,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 10,
        marginTop: 10,
    },
    });