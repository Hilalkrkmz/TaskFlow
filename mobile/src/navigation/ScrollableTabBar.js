import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

// createBottomTabNavigator'ın varsayılan tab bar'ı sabit genişlikte, çok
// sekme olunca sıkışıyor. React Navigation'ın Tab.Navigator'ı `tabBar` prop'una
// tamamen özel bir component vermene izin veriyor - burada onu yatay
// kaydırılabilir bir ScrollView ile yeniden yazıyoruz. `state`/`descriptors`/
// `navigation` üçü de React Navigation tarafından otomatik geçiriliyor.
export const TAB_ICONS = {
    Home: "home",
    Calendar: "calendar",
    Notes: "document-text",
    Focus: "timer",
    Statistics: "bar-chart",
    Themes: "color-palette",
    Profile: "person",
    Settings: "settings",
};

function ScrollableTabBar({ state, descriptors, navigation }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <SafeAreaView edges={["bottom"]} style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const label = options.title ?? route.name;
                    const iconName = `${TAB_ICONS[route.name]}${isFocused ? "" : "-outline"}`;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable key={route.key} onPress={onPress} style={styles.tabItem}>
                            <Ionicons
                                name={iconName}
                                size={22}
                                color={isFocused ? colors.text : colors.textMuted}
                            />
                            <Text style={[styles.label, isFocused && styles.labelActive]}>
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        content: {
            paddingHorizontal: 8,
        },
        tabItem: {
            width: 68,
            paddingVertical: 8,
            alignItems: "center",
            justifyContent: "center",
        },
        label: {
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 2,
        },
        labelActive: {
            color: colors.text,
            fontWeight: "600",
        },
    });
}

export default ScrollableTabBar;
