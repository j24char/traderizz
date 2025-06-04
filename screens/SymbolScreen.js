// SymbolScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import createStyles from '../styles/styles';

export default function SymbolScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { symbol, name } = route.params || {};
  const styles = createStyles();

  // TradingView widget URL with dynamic symbol
  const widgetHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;">
        <div id="tradingview_widget"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": 400,
            "symbol": "${symbol || 'AAPL'}",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": false,
            "hide_top_toolbar": true,
            "container_id": "tradingview_widget"
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 10 }}>
        <Text style={styles.primaryButtonText}>{'< Back'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{symbol}</Text>
      <Text style={styles.centeredText}>{name}</Text>

      <View style={{ height: 400 }}>
        <WebView
          originWhitelist={['*']}
          source={{ html: widgetHtml }}
          javaScriptEnabled
          style={{ flex: 1 }}
        />
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          navigation.goBack()
        }}
      >
        <Text style={styles.addButtonText}>Back to Search</Text>
      </TouchableOpacity>
    </View>
  );
}
