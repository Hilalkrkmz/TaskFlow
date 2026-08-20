import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FocusScreen from "../screens/FocusScreen";
import SessionHistoryScreen from "../screens/SessionHistoryScreen";

const Stack = createNativeStackNavigator();

// Focus tab'ina ozel kucuk bir ic stack - "View all sessions" Session History'e
// push yapabilsin diye. Diger tab'larin navigasyonuna dokunmuyor, tab bar'daki
// route adi hala "Focus" (bkz. RootNavigator.js), bu ic ekran adlari gorunmez.
function FocusStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FocusHome" component={FocusScreen} />
            <Stack.Screen name="SessionHistory" component={SessionHistoryScreen} />
        </Stack.Navigator>
    );
}

export default FocusStackNavigator;
