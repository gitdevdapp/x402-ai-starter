# 🚀 DNS Setup Guide: Namecheap + Vercel

## Overview
This guide provides the **exact DNS records** you need to add to Namecheap to connect your custom domain to Vercel. This enables your x402 AI Payment Platform to be publicly accessible at your custom domain.

## 📋 Prerequisites
- ✅ Vercel account with deployed x402 project
- ✅ Custom domain purchased from Namecheap
- ✅ Access to Namecheap Domain Control Panel

---

## 🔧 Step 1: Add Domain to Vercel

### 1.1 Access Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your x402 project
3. Click **Settings** tab
4. Click **Domains** in the left sidebar

### 1.2 Add Your Domain
1. Click **Add** button
2. Enter your domain name (e.g., `yourdomain.com`)
3. Click **Add Domain**
4. **Copy the CNAME value** - you'll need this for Namecheap DNS setup

---

## 🔧 Step 2: Configure DNS Records in Namecheap

### 2.1 Access Namecheap Domain Control Panel
1. Login to [namecheap.com](https://namecheap.com)
2. Go to **Domain List** → **Manage** next to your domain
3. Click **Advanced DNS** tab

### 2.2 Add Required DNS Records

#### ✅ **REQUIRED: CNAME Record for Root Domain**
```
Type: CNAME
Host: @
Value: cname.vercel-dns.com
TTL: 300 (or Automatic)
```

#### ✅ **REQUIRED: CNAME Record for WWW Subdomain**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: 300 (or Automatic)
```

### 2.3 Optional Records (Recommended)

#### 🔧 **TXT Record for Domain Verification** (if required)
```
Type: TXT
Host: @
Value: vercel-site-verification=[your-verification-code]
TTL: 300
```

#### 🔧 **MX Records** (if you want email)
```
Type: MX
Host: @
Value: [your-mail-server]
Priority: 10
TTL: 300
```

---

## 🔧 Step 3: Verify DNS Configuration

### 3.1 Check DNS Propagation
```bash
# Check if DNS records are properly set
nslookup yourdomain.com
nslookup www.yourdomain.com

# Should return something like:
# Non-authoritative answer:
# yourdomain.com	canonical name = cname.vercel-dns.com
# cname.vercel-dns.com	canonical name = your-project.vercel.app
```

### 3.2 Verify in Vercel Dashboard
1. Go back to Vercel Dashboard → Your Project → Settings → Domains
2. Your domain should show:
   - ✅ **Valid Configuration**
   - ✅ **SSL Certificate** (will be automatically provisioned)

---

## 🔧 Step 4: SSL Certificate Setup

### 4.1 Automatic SSL (Recommended)
Vercel automatically provisions SSL certificates for your domain:
- ✅ Free SSL certificate
- ✅ Auto-renewal
- ✅ HTTPS enforced by default

### 4.2 Verify SSL
```bash
# Test HTTPS connection
curl -I https://yourdomain.com

# Should return HTTP/2 200 with security headers
```

---

## 📊 DNS Records Summary

### 🎯 **Minimum Required Records** (for Vercel to work)
```
CNAME  @      cname.vercel-dns.com  TTL:300
CNAME  www    cname.vercel-dns.com  TTL:300
```

### 📋 **Complete Records Table**
| Type | Host | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| CNAME | @ | cname.vercel-dns.com | 300 | Root domain routing |
| CNAME | www | cname.vercel-dns.com | 300 | WWW subdomain routing |
| TXT | @ | vercel-site-verification=... | 300 | Domain ownership verification |

---

## 🐛 Troubleshooting

### Issue: Domain not resolving
**Symptoms**: `nslookup` doesn't show Vercel servers
**Solution**:
```bash
# Wait 24-48 hours for DNS propagation
# Check Namecheap DNS settings again
# Verify domain spelling in Vercel
```

### Issue: SSL Certificate not provisioning
**Symptoms**: Browser shows insecure connection
**Solution**:
- Wait 24 hours for SSL provisioning
- Check Vercel dashboard for certificate status
- Ensure DNS is properly configured

### Issue: WWW subdomain not working
**Symptoms**: `www.yourdomain.com` doesn't load
**Solution**:
- Add the missing CNAME record for `www`
- Wait for DNS propagation

---

## 🚀 Testing Your Setup

### Test Commands
```bash
# Test root domain
curl -f https://yourdomain.com/
curl -f https://yourdomain.com/api/chat

# Test WWW subdomain
curl -f https://www.yourdomain.com/

# Test SSL
curl -I https://yourdomain.com | grep -E "(HTTP/|Strict-Transport)"
```

### Functional Tests
1. ✅ Homepage loads: `https://yourdomain.com`
2. ✅ API endpoints work: `https://yourdomain.com/api/wallet/list`
3. ✅ SSL certificate valid: Check browser security indicator
4. ✅ Both root and www domains work

---

## 📚 Additional Resources

### Vercel Documentation
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [DNS Configuration](https://vercel.com/docs/concepts/projects/domains/dns-records)

### Namecheap Documentation
- [DNS Management](https://www.namecheap.com/support/knowledgebase/article.aspx/579/2237/)
- [Domain Configuration](https://www.namecheap.com/support/knowledgebase/article.aspx/207/2238/)

---

## ⚡ Quick Reference

### DNS Records for Namecheap:
```
Type: CNAME, Host: @, Value: cname.vercel-dns.com
Type: CNAME, Host: www, Value: cname.vercel-dns.com
```

### Verification Commands:
```bash
nslookup yourdomain.com
curl -I https://yourdomain.com
```

### Timeline:
- DNS Setup: 5 minutes
- DNS Propagation: 24-48 hours
- SSL Provisioning: 24 hours
- Full Setup: 2-3 days

---

## 🎯 Success Checklist

- [ ] Domain added to Vercel dashboard
- [ ] CNAME records added in Namecheap DNS
- [ ] DNS propagation completed (24-48 hours)
- [ ] SSL certificate provisioned
- [ ] HTTPS working on both root and www
- [ ] All x402 functionality accessible via custom domain

**Status**: 🟢 Ready for production deployment with custom domain
