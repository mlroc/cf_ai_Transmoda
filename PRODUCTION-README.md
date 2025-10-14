# Transmoda - Production Deployment Guide

## 🚀 Production-Ready Features

### Security
- ✅ No hardcoded API keys or secrets
- ✅ All sensitive data stored in environment variables
- ✅ Proper CORS configuration
- ✅ Content Security Policy (CSP) headers
- ✅ Input validation and sanitization
- ✅ Rate limiting and error handling

### Performance
- ✅ Optimized code with no debug logs
- ✅ Efficient PDF processing
- ✅ Cached responses where appropriate
- ✅ Minimal bundle sizes
- ✅ Edge-optimized deployment

### Configuration
- ✅ Centralized configuration management
- ✅ Environment-based settings
- ✅ Production-ready error messages
- ✅ Proper logging and monitoring

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Set these in your Cloudflare Workers dashboard:

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here
PROMPT_SUMMARY=your_summary_prompt_here
PROMPT_SHORTFORM=your_shortform_prompt_here

# Optional
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. API Keys Setup
```bash
# Set Gemini API key
npx wrangler secret put GEMINI_API_KEY

# Set AI prompts
npx wrangler secret put PROMPT_SUMMARY
npx wrangler secret put PROMPT_SHORTFORM

# Optional: Set allowed origins
npx wrangler secret put ALLOWED_ORIGINS
```

### 3. Domain Configuration
- Configure your custom domain in Cloudflare Pages
- Update DNS records as needed
- Set up SSL certificates

## 🚀 Deployment

### Quick Deploy
```bash
./deploy-production.sh
```

### Manual Deploy
```bash
# Deploy worker
cd worker
npx wrangler deploy --env production

# Build and deploy web app
cd ../web
npm run build
# Deploy to your hosting platform
```

## 🔧 Configuration Files

### Worker Configuration (`worker/wrangler.toml`)
- Production environment settings
- Durable Objects configuration
- Compatibility flags

### Web App Configuration (`web/src/lib/config.ts`)
- Centralized configuration
- Environment variable support
- Type-safe settings

## 📊 Monitoring

### Health Checks
- `/test` endpoint for basic health check
- Monitor API response times
- Track error rates

### Logs
- Cloudflare Workers logs via `wrangler tail`
- Monitor for errors and performance issues
- Set up alerts for critical failures

## 🛡️ Security Considerations

### API Security
- All API keys stored as secrets
- No sensitive data in code
- Proper CORS configuration
- Input validation

### Content Security Policy
- Configured in `next.config.ts`
- Allows necessary CDN resources
- Blocks unauthorized scripts

### Rate Limiting
- Consider implementing rate limiting
- Monitor for abuse
- Set up DDoS protection

## 🔄 Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update API keys as needed

### Monitoring
- Set up uptime monitoring
- Track performance metrics
- Monitor error rates

### Backup
- Regular backups of configuration
- Document all environment variables
- Keep deployment scripts updated

## 🆘 Troubleshooting

### Common Issues
1. **API Key Errors**: Check environment variables
2. **CORS Issues**: Verify ALLOWED_ORIGINS setting
3. **PDF Processing**: Check CSP configuration
4. **Performance**: Monitor Cloudflare Workers limits

### Debug Mode
For debugging, temporarily add logging:
```typescript
console.log('Debug info:', { key: 'value' });
```

### Support
- Check Cloudflare Workers documentation
- Review Next.js deployment guides
- Monitor application logs

## 📈 Performance Optimization

### Worker Optimization
- Minimize cold starts
- Optimize bundle size
- Use efficient algorithms

### Web App Optimization
- Enable Next.js optimizations
- Use CDN for static assets
- Implement proper caching

## 🔐 Security Best Practices

1. **Never commit secrets to git**
2. **Use environment variables for all configuration**
3. **Regular security audits**
4. **Keep dependencies updated**
5. **Monitor for vulnerabilities**

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `PROMPT_SUMMARY` | Yes | AI prompt for summarization |
| `PROMPT_SHORTFORM` | Yes | AI prompt for shortform content |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed origins |
| `NEXT_PUBLIC_API_URL` | No | API base URL (defaults to worker URL) |
| `NEXT_PUBLIC_APP_URL` | No | App URL for metadata |

---

**Ready for production! 🎉**
