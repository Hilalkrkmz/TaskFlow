import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ScrollableTabBar from "./ScrollableTabBar";
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import NotesScreen from "../screens/NotesScreen";
import FocusScreen from "../screens/FocusScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import ThemesScreen from "../screens/ThemesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import apiClient from "../api/client";
import { getToken, deleteToken } from "../auth/tokenStorage";
import { ThemeProvider } from "../theme/ThemeContext";
import ThemeDecoration from "../components/ThemeDecoration";

// Web'deki App.jsx'teki `currentUser` state mantığının RN karşılığı:
// token yoksa/gecersizse AuthStack (Login/Register/VerifyEmail/ForgotPassword),
// varsa AppStack (Home ve gelecekte diger ekranlar) gösterilir.

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </Stack.Navigator>
    );
}

function AppStack({ currentUser, onLogout, onThemeChange }) {
    return (
        <Tab.Navigator
            tabBar={(props) => <ScrollableTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "TaskFlow" }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Notes" component={NotesScreen} />
            <Tab.Screen name="Focus" component={FocusScreen} />
            <Tab.Screen name="Statistics" component={StatisticsScreen} />
            <Tab.Screen name="Themes">
                {(props) => <ThemesScreen {...props} onThemeChange={onThemeChange} />}
            </Tab.Screen>
            <Tab.Screen name="Profile">
                {(props) => <ProfileScreen {...props} currentUser={currentUser} onLogout={onLogout} />}
            </Tab.Screen>
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
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

    const handleThemeChange = (theme) => {
        setCurrentUser((prev) => (prev ? { ...prev, theme } : prev));
    };

    if (authChecking) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ThemeProvider initialTheme={currentUser?.theme}>
            <NavigationContainer>
                {currentUser ? (
                    <View style={styles.appContainer}>
                        <AppStack
                            currentUser={currentUser}
                            onLogout={handleLogout}
                            onThemeChange={handleThemeChange}
                        />
                        <View style={StyleSheet.absoluteFill} pointerEvents="none">
                            <ThemeDecoration />
                        </View>
                    </View>
                ) : (
                    <AuthStack onAuthSuccess={handleAuthSuccess} />
                )}
            </NavigationContainer>
        </ThemeProvider>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        flex: 1,
    },
});

export default RootNavigator;