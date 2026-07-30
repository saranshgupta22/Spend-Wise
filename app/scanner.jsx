import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScannerModal() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>SpendWise needs Camera permission to scan UPI QR Codes</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }) => {
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Check if it is a UPI Intent URL
    if (data.includes('upi://')) {
      alert(`Scanned UPI Code. Redirecting...`);
      Linking.openURL(data).catch(() => alert('Could not open UPI app'));
    } else {
      alert(`Scanned Code: ${data}`);
    }

    setTimeout(() => {
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.overlay}>
            <BlurView
              intensity={THEME.glass?.intensity || 40}
              tint="dark"
              style={[styles.headerBlur, { paddingTop: Math.max(insets.top, 20) + 18 }]}
            >
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>PAYMENT SCANNER</Text>
                <Text style={styles.headerText}>Scan UPI QR</Text>
                <Text style={styles.headerSubtext}>
                  Hold the code inside the frame to open your payment app.
                </Text>
              </View>
              <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#FFF" />
              </Pressable>
            </BlurView>

            <View style={styles.reticleContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>

            <BlurView intensity={28} tint="dark" style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}>
              <Text style={styles.instructionTitle}>Ready to scan</Text>
              <Text style={styles.instruction}>
                Align the QR code within the frame. SpendWise will detect it automatically.
              </Text>
            </BlurView>
          </View>
        </CameraView>
      ) : (
        <Text style={styles.message}>Camera not supported on Web.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontFamily: 'Inter-Regular', 
    color: '#fff',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerBlur: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(2, 6, 23, 0.46)',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  headerEyebrow: {
    fontFamily: 'Inter-Bold',
    color: THEME.colors.secondary,
    letterSpacing: 2,
    fontSize: 11,
    marginBottom: 6,
  },
  headerText: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    letterSpacing: 0.4,
    fontSize: 24,
  },
  headerSubtext: {
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleContainer: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: THEME.colors.primary,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 18,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(2, 6, 23, 0.54)',
  },
  instructionTitle: {
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 6,
  },
  instruction: {
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 20,
  },
});
