import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";

// Şimdilik tek ekran var. Login/Register/VerifyEmail/ForgotPassword ekranları
// gelince burası iki ayrı Stack'e bölünecek:
//   - AuthStack (Login, Register, VerifyEmail, ForgotPassword, VerifyResetCode, ResetPassword)
//   - AppStack (Home, Calendar, Notes, Focus, Statistics, Themes, Profile, Settings)
// ve token varlığına göre hangisinin gösterileceğine RootNavigator karar verecek
// (App.jsx'teki `currentUser` state mantığının RN karşılığı).

const Stack = createNativeStackNavigator();

function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: "TaskFlow" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default RootNavigator;