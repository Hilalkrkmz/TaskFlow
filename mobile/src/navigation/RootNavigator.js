import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import NotesScreen from "../screens/NotesScreen";
import FocusScreen from "../screens/FocusScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import apiClient from "../api/client";
import { getToken, deleteToken } from "../auth/tokenStorage";

// Web'deki Sidebar.jsx'in 8 ögesinin (Home/Calendar/Notes/Focus/Statistics/
// Themes/Profile/Settings) mobildeki karşılığı. Telefon ekranında 8 sekme
// sığmaz, bu yüzden en önemli 5'i (Home/Calendar/Notes/Focus/Profile) alt tab
// bar'da; Statistics/Themes/Settings ileride ayrı bir adımda planlanacak.
const TAB_ICONS = {
    Home: "home",
    Calendar: "calendar",
    Notes: "document-text",
    Focus: "timer",
    Profile: "person",
};

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

function AppStack({ currentUser, onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size, focused }) => (
                    <Ionicons
                        name={`${TAB_ICONS[route.name]}${focused ? "" : "-outline"}`}
                        size={size}
                        color={color}
                    />
                ),
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "TaskFlow" }} />
            <Tab.Screen name="Calendar" component={CalendarScreen} />
            <Tab.Screen name="Notes" component={NotesScreen} />
            <Tab.Screen name="Focus" component={FocusScreen} />
            <Tab.Screen name="Profile">
                {(props) => <ProfileScreen {...props} currentUser={currentUser} onLogout={onLogout} />}
            </Tab.Screen>
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
                <AppStack currentUser={currentUser} onLogout={handleLogout} />
            ) : (
                <AuthStack onAuthSuccess={handleAuthSuccess} />
            )}
        </NavigationContainer>
    );
}

export default RootNavigator;