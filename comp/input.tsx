import { TextInput, TextInputProps, View } from "react-native";
import { inputStyles } from '../style/inputStyles';
import { colors } from "../style/colors";

interface InputProps extends TextInputProps {
    error?: boolean;
    children?: React.ReactNode;
}

export function Input({ error, style, children, ...rest }: InputProps) {
    if (children) {
        return (
            <View >
                {children}
            </View>
        );
    }

    return (
        <TextInput
            style={[
                inputStyles.input,
                error && { borderColor: '#ff0000' },
                style
            ]}
            secureTextEntry={false}
            placeholderTextColor="#666"
            {...rest}
        />
    );
}

export function InputField(props: TextInputProps) {
    return (
        <TextInput 
            style={inputStyles.input}
            placeholderTextColor={colors.gray}
            cursorColor={colors.red}
            {...props}
        />
    );
}