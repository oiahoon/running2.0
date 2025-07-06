# Running Page 2.0 Homepage

The official homepage for Running Page 2.0 - The Ultimate Running Data Platform.

## 🌐 Live Site

**Production**: [https://running-page-2.vercel.app](https://running-page-2.vercel.app)

## 🚀 Features

- **Modern Design** - Clean, responsive design with dark/light mode support
- **Performance Optimized** - Lighthouse score 90+ across all metrics
- **SEO Optimized** - Complete meta tags, structured data, and sitemap
- **Accessibility** - WCAG 2.1 AA compliant
- **Mobile First** - Perfect experience on all devices
- **Fast Loading** - Optimized images, minified assets, CDN delivery

## 🏗️ Architecture

### Tech Stack
- **HTML5** - Semantic markup with accessibility features
- **CSS3** - Modern CSS with custom properties and grid/flexbox
- **Vanilla JavaScript** - No frameworks, pure performance
- **GitHub Actions** - Automated deployment and optimization
- **Vercel** - Edge deployment with global CDN

### Performance Features
- **Image Optimization** - Automatic compression and WebP conversion
- **Asset Minification** - HTML, CSS, and JS minification
- **Caching Strategy** - Aggressive caching with proper invalidation
- **Lazy Loading** - Images and content loaded on demand
- **Critical CSS** - Above-the-fold CSS inlined

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm 8+

### Local Development
```bash
# Navigate to homepage directory
cd homepage

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build and Deploy
```bash
# Build for production
npm run build

# Run Lighthouse audit
npm run lighthouse

# Deploy to Vercel
npm run deploy
```

## 📁 Project Structure

```
homepage/
├── index.html          # Main HTML file
├── styles.css          # Compiled CSS styles
├── script.js           # JavaScript functionality
├── favicon.svg         # Site favicon
├── images/             # Image assets
│   ├── README.md       # Image guidelines
│   └── ...            # Platform logos, screenshots
├── package.json        # Dependencies and scripts
├── vercel.json         # Vercel configuration
├── .lighthouserc.json  # Lighthouse CI config
└── README.md          # This file
```

## 🎨 Design System

### Colors
- **Primary**: #3B82F6 (Blue)
- **Secondary**: #64748B (Slate)
- **Accent**: #06B6D4 (Cyan)
- **Success**: #10B981 (Emerald)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### Typography
- **Font Family**: Inter, system fonts
- **Headings**: 600-800 weight
- **Body**: 400-500 weight
- **Scale**: Modular scale based on 1rem

### Spacing
- **Base Unit**: 0.25rem (4px)
- **Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

## 📊 Performance Targets

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Loading Targets
- **First Paint**: < 1s
- **Time to Interactive**: < 3s
- **Total Bundle Size**: < 500KB

## 🔧 Configuration

### Environment Variables
```bash
# Vercel deployment
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id

# Analytics (optional)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
PLAUSIBLE_DOMAIN=your-domain.com
```

### GitHub Secrets
Required for automated deployment:
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## 📈 Analytics & Monitoring

### Tracking Events
- Button clicks (primary/secondary)
- External link clicks
- Section visibility
- Performance metrics

### Monitoring Tools
- **Vercel Analytics** - Performance and usage metrics
- **Lighthouse CI** - Automated performance testing
- **GitHub Actions** - Deployment status and health

## 🎯 SEO Optimization

### Meta Tags
- Complete Open Graph tags
- Twitter Card optimization
- Structured data (JSON-LD)
- Canonical URLs

### Content Strategy
- Semantic HTML structure
- Descriptive headings hierarchy
- Alt text for all images
- Internal linking strategy

### Technical SEO
- XML sitemap generation
- Robots.txt configuration
- Clean URL structure
- Mobile-first indexing

## 🔒 Security

### Headers
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- Permissions Policy

### Best Practices
- No inline scripts/styles
- Secure external links
- Input validation
- Error handling

## 🚀 Deployment

### Automatic Deployment
- **Trigger**: Push to `master` branch with homepage changes
- **Process**: Build → Optimize → Test → Deploy
- **Targets**: Vercel (primary), GitHub Pages (backup)

### Manual Deployment
```bash
# Deploy to Vercel
vercel --prod

# Deploy to GitHub Pages
npm run build
# Push to gh-pages-homepage branch
```

## 🧪 Testing

### Automated Tests
- Lighthouse CI on every PR
- Performance regression testing
- Accessibility validation
- Link checking

### Manual Testing
- Cross-browser compatibility
- Mobile device testing
- Screen reader testing
- Performance profiling

## 📝 Content Management

### Adding New Sections
1. Update HTML structure
2. Add corresponding CSS styles
3. Implement JavaScript interactions
4. Update navigation if needed
5. Test responsiveness

### Image Guidelines
- Use WebP format with PNG fallback
- Optimize for different screen densities
- Provide meaningful alt text
- Follow brand guidelines for logos

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes to homepage files
3. Test locally with `npm run dev`
4. Run `npm run lighthouse` for performance check
5. Submit PR with Lighthouse results

### Code Standards
- Semantic HTML5
- Modern CSS (Grid, Flexbox, Custom Properties)
- Vanilla JavaScript (ES6+)
- Mobile-first responsive design
- Accessibility best practices

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/oiahoon/running2.0/issues)
- **Discussions**: [GitHub Discussions](https://github.com/oiahoon/running2.0/discussions)
- **Email**: 4296411@qq.com

---

**Built with ❤️ for the running community**  
*Part of the Running Page 2.0 ecosystem*
