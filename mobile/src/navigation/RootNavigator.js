import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import apiClient from "../api/client";
import { getToken, deleteToken } from "../auth/tokenStorage";

// Web'deki App.jsx'teki `currentUser` state mantığının RN karşılığı:
// token yoksa/gecersizse AuthStack (Login/Register/VerifyEmail/ForgotPassword),
// varsa AppStack (Home ve gelecekte diger ekranlar) gösterilir.

const Stack = createNativeStackNavigator();

function AuthStack({ onAuthSuccess }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLoginSuccess={onAuthSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="VerifyEmail">
                {(props) => <VerifyEmailScreen {...props} onVerifySuccess={onAuthSuccess} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

function AppStack({ onLogout }) {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" options={{ title: "TaskFlow" }}>
                {(props) => <HomeScreen {...props} onLogout={onLogout} />}
            </Stack.Screen>
        </Stack.Navigator>
    );
}

function RootNavigator() {
    const [currentUser, setCurrentUser] = useState(null);
    const [authChecking, setAuthChecking] = useState(true);

    useEffect(() => {
        const checkExistingLogin = async () => {
            const token = await getToken();

            if (!token) {
                setAuthChecking(false);
                return;
            }

            try {
                const response = await apiClient.get("/users/me");
                const { fullName, email, theme } = response.data;
                setCurrentUser({ fullName, email, theme });
            } catch (err) {
                await deleteToken();
            } finally {
                setAuthChecking(false);
            }
        };

        checkExistingLogin();
    }, []);

    const handleAuthSuccess = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = async () => {
        await deleteToken();
        setCurrentUser(null);
    };

    if (authChecking) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {currentUser ? (
                <AppStack onLogout={handleLogout} />
            ) : (
                <AuthStack onAuthSuccess={handleAuthSuccess} />
            )}
        </NavigationContainer>
    );
}

export default RootNavigator;