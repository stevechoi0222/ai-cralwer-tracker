# How to Create a KV Namespace in Cloudflare Dashboard

## What is a KV Namespace?

A KV (Key-Value) namespace is like a database where your Worker stores the crawler tracking data. Think of it as a folder that holds all your logs.

## Step-by-Step Instructions

### Option 1: From Workers & Pages (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com
   - Login with your account

2. **Navigate to Workers & Pages**
   - Look at the left sidebar
   - Click on **"Workers & Pages"**
   - You should see your `ai-logger` worker listed here

3. **Click on the KV Tab**
   - At the TOP of the page, you'll see tabs: Overview | KV | R2 | D1 | Queues
   - Click on **"KV"**

4. **Create Namespace Button**
   - You'll see a button that says **"Create a namespace"** or **"Create namespace"**
   - Click it

5. **Name Your Namespace**
   - A popup/form will appear
   - Enter the name: `LOGS` (all caps, exactly like that)
   - Click **"Add"** or **"Create"**

6. **Copy the Namespace ID**
   - After creating, you'll see your namespace listed
   - It will show something like:
     ```
     LOGS
     ID: a1b2c3d4e5f6g7h8...
     ```
   - **Copy this ID** - you'll need it in the next step!

### Option 2: From Account Home

1. Go to https://dash.cloudflare.com
2. Click on **"Workers & Pages"** in left sidebar
3. Click **"KV"** at the top
4. Click **"Create a namespace"**
5. Name it: `LOGS`
6. Click "Add"

## What You'll See

After creating, you should see:

```
┌──────────────────────────────────────────────────────┐
│  KV Namespaces                                       │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │ LOGS                                       │    │
│  │ ID: abc123def456...                        │    │
│  │ Created: just now                          │    │
│  │ [View] [Delete]                            │    │
│  └────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

## Next Step: Bind KV to Your Worker

Now that you have the namespace, you need to **connect it to your worker**:

### How to Bind KV Namespace to Worker:

1. **Go to your Worker**
   - Click **"Workers & Pages"** in sidebar
   - Click **"Overview"** tab at top
   - Find and click your **"ai-logger"** worker

2. **Open Settings**
   - Click **"Settings"** tab at the top of the worker page

3. **Find Variables Section**
   - Scroll down to **"Variables and Secrets"** section
   - Or look for **"Bindings"** section

4. **Add KV Namespace Binding**
   - Under **"KV Namespace Bindings"**, click **"Add binding"** button
   - Or click **"Edit variables"** → **"Add variable"** → Choose "KV Namespace"

5. **Fill in the Binding**
   - **Variable name**: `LOGS` (must be exactly this - all caps)
   - **KV namespace**: Select "LOGS" from the dropdown (the one you just created)
   - Click **"Save"** or **"Deploy"**

6. **Deploy the Changes**
   - Click **"Save and Deploy"** button at the top
   - This applies the binding to your worker

## Visual Guide

```
Dashboard
  ↓
Workers & Pages (left sidebar)
  ↓
KV (top tab)
  ↓
Create a namespace (button)
  ↓
Name: LOGS
  ↓
Add (button)
  ↓
✓ Namespace created!
```

## Verify It Worked

After binding, go back to your worker:

1. Click on your `ai-logger` worker
2. Click **"Settings"** tab
3. Scroll to **"Variables and Secrets"** or **"Bindings"**
4. You should see:
   ```
   KV Namespace Bindings
   LOGS → LOGS (abc123...)
   ```

## Alternative: Check from KV Page

You can also verify from the KV page:

1. Workers & Pages → KV
2. Click **"View"** next to your LOGS namespace
3. You should see:
   - "0 keys" (empty for now - data will appear after tracking starts)
   - No error messages

## Troubleshooting

### Can't find "Create namespace" button?

Make sure you're in the right place:
- Workers & Pages (left sidebar)
- KV tab (top of page)
- Look for orange/blue button

### "Namespace already exists" error?

You may have already created it. Check the list of namespaces:
- Workers & Pages → KV
- Look for "LOGS" in the list
- If it exists, just use that one!

### Don't see KV tab?

Try:
- Workers & Pages → Overview
- Look for "KV Namespaces" card
- Click "Manage" or "Create"

### Can't bind to worker?

Make sure:
- Variable name is exactly: `LOGS` (all caps)
- You selected the correct namespace from dropdown
- You clicked "Save and Deploy" after adding binding

## What Happens After Binding?

Once bound, your Worker code can access KV storage:

```javascript
// Your worker can now do:
await env.LOGS.put(key, value);  // Store data
await env.LOGS.get(key);         // Retrieve data
await env.LOGS.list();           // List all keys
```

The `env.LOGS` comes from the binding you just created!

## Next: Test Your Setup

After binding KV:

1. Visit your worker URL:
   ```
   https://ai-logger.YOUR-SUBDOMAIN.workers.dev/pixel.gif?token=sandbox-2025-11-05&page=/test
   ```

2. Check if data was stored:
   - Go to Workers & Pages → KV → LOGS
   - Click "View"
   - You should see a key like: `log:1699999999999:uuid-here`
   - Click it to see the stored JSON data

3. Fetch the data:
   ```
   https://ai-logger.YOUR-SUBDOMAIN.workers.dev/api/logs?token=sandbox-2025-11-05&limit=5
   ```
   - Should return JSON array with your test request

If you see data, it's working! 🎉

## Need More Help?

If you're still stuck, let me know:
- What page are you on in the dashboard?
- What do you see when you click "Workers & Pages"?
- Do you see any buttons or tabs at the top?

I can guide you through it step by step!
