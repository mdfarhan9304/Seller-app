import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
  showBackButton?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
  statusBarBackgroundColor?: string;
  loading?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightAction,
  showBackButton = true,
  statusBarStyle = 'light-content',
  statusBarBackgroundColor = '#8D14CE',
  loading = false,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBackgroundColor} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
          {rightAction || loading ? (
            <View style={styles.rightActionContainer}>{loading ? <ActivityIndicator size="small" color="white" /> : rightAction}</View>
          ) : showBackButton ? (
            <View style={styles.placeholder} />
          ) : null}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,

  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  rightActionContainer: {
    marginLeft: 16,
  },
  placeholder: {
    width: 40,
  },
});

export default Header;

