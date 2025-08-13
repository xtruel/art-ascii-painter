# aiR---//generatorAsc11...!! - itch.io Beta Build Instructions

## Building for itch.io

This app is configured to work perfectly with itch.io's file hosting system.

### Quick Build Steps:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Create the itch.io package:**
   - The build creates a `dist` folder with all necessary files
   - Zip the entire contents of the `dist` folder
   - Upload the zip file to itch.io

### itch.io Upload Instructions:

1. Go to your itch.io dashboard
2. Create a new project or edit existing one
3. Set the project title to: **aiR---//generatorAsc11...!!**
4. Upload the zip file containing the `dist` folder contents
5. Set the project type to "HTML" 
6. Enable "This file will be played in the browser"
7. Set viewport dimensions (recommended: 1200x800 or fullscreen)

### Features Included in Beta:

- ✅ HashRouter for file:// protocol compatibility
- ✅ Animated ASCII art background decorations
- ✅ Dual theme system (dark/light with red/purple palettes)
- ✅ Responsive sidebar layout
- ✅ Text and image ASCII generation
- ✅ Copy/download functionality
- ✅ Randomize controls (shuffle button)
- ✅ Character spacing and customization
- ✅ Multiple ASCII character ramps
- ✅ Mobile-responsive design

### Testing Checklist:

- [ ] Test text to ASCII conversion
- [ ] Test image upload and conversion
- [ ] Test theme switching (dark/light)
- [ ] Test randomize button (should only randomize settings)
- [ ] Test copy to clipboard
- [ ] Test download functionality
- [ ] Test on different screen sizes
- [ ] Verify animated decorations are working
- [ ] Check that the app loads properly on itch.io

### Technical Notes:

- Uses HashRouter instead of BrowserRouter for itch.io compatibility
- All paths are relative (`base: './'` in vite.config.ts)
- No external dependencies that require server-side processing
- Pure client-side application ready for static hosting

### Build Output:

The `dist` folder contains:
- `index.html` - Main entry point
- `assets/` - CSS, JS, and other static assets
- All dependencies bundled and optimized

Simply zip the contents of `dist` and upload to itch.io!