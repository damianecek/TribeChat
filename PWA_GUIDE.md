# Progressive Web App (PWA) Features

TribeChat is now a Progressive Web App (PWA), which means it can be installed on devices and work offline.

## What is a PWA?

A Progressive Web App is a web application that uses modern web capabilities to deliver an app-like experience to users. Key features include:

- **Installable**: Can be installed on devices like a native app
- **Offline Support**: Works without internet connection (limited functionality)
- **Fast Loading**: Cached resources load instantly
- **Responsive**: Works on any device and screen size
- **App-like**: Full-screen mode without browser UI
- **Updates**: Automatically updates when online

## PWA Features in TribeChat

### 1. Installation

Users can install TribeChat on their devices:

#### Desktop (Chrome, Edge, Brave)
1. Visit the TribeChat website
2. Click the install icon (⊕) in the address bar
3. Or go to browser menu → "Install TribeChat"
4. The app will appear as a desktop application

#### Mobile (Android)
1. Visit the TribeChat website
2. Tap the browser menu (⋮)
3. Select "Add to Home Screen" or "Install App"
4. The app icon will appear on your home screen

#### Mobile (iOS Safari)
1. Visit the TribeChat website
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. The app icon will appear on your home screen

### 2. Offline Support

TribeChat caches essential resources for offline use:

**What works offline:**
- View previously loaded messages
- Navigate through the app interface
- Access cached channel information
- View user profiles that were previously loaded

**What requires internet:**
- Sending new messages
- Receiving new messages
- Creating/joining channels
- Real-time updates
- User authentication

### 3. App Manifest

The PWA manifest defines how the app appears when installed:

```json
{
  "name": "TribeChat",
  "short_name": "TribeChat",
  "description": "IRC WebChat Client - Real-time messaging application",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1d1d1d",
  "theme_color": "#1976d2",
  "categories": ["social", "communication"]
}
```

### 4. Service Worker

A service worker runs in the background and provides:

- **Caching Strategy**: Network-first for API calls, cache-first for static assets
- **Offline Fallback**: Shows cached content when offline
- **Background Sync**: Queues failed requests to retry when online
- **Push Notifications**: (Future feature) Receive notifications when app is closed

### 5. Icons and Splash Screens

Multiple icon sizes are provided for different devices:

- 128x128px - Small icon
- 192x192px - Standard icon
- 256x256px - Medium icon
- 384x384px - Large icon
- 512x512px - Extra large icon

These are automatically used for:
- Home screen icons
- Task switcher
- Splash screens
- Browser tabs

## Development

### Building for PWA

The production build automatically includes PWA features:

```bash
# Frontend build with PWA
cd frontend
npm run build  # or: quasar build -m pwa
```

### Service Worker Configuration

Location: `frontend/src-pwa/`

**register-service-worker.ts** - Registers and manages the service worker
**custom-service-worker.ts** - Custom service worker logic (if using InjectManifest mode)
**manifest.json** - PWA manifest file

### Testing PWA Features

#### Development Mode
```bash
cd frontend
quasar dev -m pwa
```

#### Production Mode
Build and serve the production files:

```bash
cd frontend
npm run build
# Serve the dist/pwa folder with a static server
```

#### Chrome DevTools
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check:
   - Manifest: View app manifest
   - Service Workers: See registered workers
   - Cache Storage: Inspect cached resources
   - Offline: Test offline mode

### Lighthouse Audit

Test PWA compliance:

1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

A good PWA score should be 90+.

## Configuration

### Workbox Options

Edit `frontend/quasar.config.ts` to customize caching:

```typescript
pwa: {
  workboxMode: 'GenerateSW',
  extendGenerateSWOptions(cfg) {
    cfg.skipWaiting = true
    cfg.clientsClaim = true
    cfg.runtimeCaching = [
      {
        urlPattern: /^https:\/\/api\.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 300
          }
        }
      }
    ]
  }
}
```

### Manifest Customization

Edit `frontend/src-pwa/manifest.json`:

```json
{
  "name": "Your App Name",
  "short_name": "App",
  "description": "Your app description",
  "theme_color": "#your-color",
  "background_color": "#your-color"
}
```

## Browser Support

PWA features are supported by:

- ✅ Chrome 40+ (Android, Desktop)
- ✅ Edge 17+
- ✅ Firefox 44+
- ✅ Safari 11.1+ (limited support)
- ✅ Samsung Internet 4+
- ✅ Opera 27+

**Note**: iOS Safari has limited PWA support. Some features may not work as expected.

## Best Practices

1. **Always use HTTPS** - PWAs require secure connections (except localhost)
2. **Test offline mode** - Ensure critical features work offline
3. **Optimize cache size** - Don't cache too much data
4. **Update service worker** - Deploy new versions regularly
5. **Handle updates gracefully** - Notify users of app updates
6. **Provide offline feedback** - Show clear offline indicators

## Troubleshooting

### Service Worker Not Registering

**Problem**: Service worker doesn't register
**Solutions**:
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors
- Clear browser cache and reload
- Verify service worker file is being served

### App Not Installable

**Problem**: Install prompt doesn't appear
**Solutions**:
- Check manifest.json is valid
- Ensure all required icons exist
- Verify HTTPS is enabled
- Check Lighthouse PWA audit

### Offline Mode Not Working

**Problem**: App doesn't work offline
**Solutions**:
- Check service worker is registered
- Verify caching strategy in DevTools
- Test with "Offline" mode in DevTools
- Check console for service worker errors

### Cache Not Updating

**Problem**: Old content is showing
**Solutions**:
- Increment service worker version
- Use "Update on reload" in DevTools
- Clear application cache manually
- Implement cache versioning strategy

## Future Enhancements

Planned PWA features for future releases:

- 🔔 **Push Notifications** - Real-time message notifications
- 🔄 **Background Sync** - Queue messages when offline
- 📱 **Share API** - Share content from/to the app
- 📥 **Install Prompt** - Custom install experience
- 🎨 **Theme Customization** - User-selected themes
- 🌐 **Multi-language** - i18n support

## Resources

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Quasar PWA Documentation](https://quasar.dev/quasar-cli-vite/developing-pwa/introduction)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
