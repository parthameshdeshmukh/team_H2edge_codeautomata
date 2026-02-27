Step-by-Step Guide to Run the Certificate DAppStep 

## Step 1: Install Required Tools

Make sure these are installed:

1. **Node.js**
    - Download from: https://nodejs.org
    - Install the LTS version.
2. **MetaMask extension**
    - Install from: https://metamask.io
    - Create or import a wallet.

---

## Step 2: Get Sepolia Test ETH

You already did this, but confirm:

1. Open MetaMask.
2. Switch network to **Sepolia**.
3. Confirm you have **0.05 Sepolia ETH**.

---

## Step 3: Clone the Project

Open **Terminal** and run:

```
git clone https://github.com/akhilkailas017/Certificate-dApp.git
cd certificate-dapp
```

---

## Step 4: Install Dependencies

```
npm install
```

Wait until installation finishes.

---

## Step 5: Deploy the Smart Contract (Using Remix – easiest)

### 5.1 Open Remix

1. Go to: https://remix.ethereum.org
2. Click **File Explorer**.

### 5.2 Upload the Contract

1. Open the `contracts` folder from your project.
2. Find **Cert.sol**.
3. Copy its code.
4. In Remix:
    - Create a new file named **Cert.sol**.
    - Paste the code.

---

### 5.3 Compile the Contract

1. Click the **Solidity Compiler** tab.
2. Click **Compile Cert.sol**.
3. Make sure no errors appear.

---

### 5.4 Deploy the Contract

1. Go to **Deploy & Run Transactions** tab.
2. In **Environment**, select:
    
    ```
    Injected Provider – MetaMask
    ```
    
3. MetaMask will open.
4. Ensure network is:
    
    ```
    Sepolia
    ```
    
5. Click **Deploy**.
6. Confirm transaction in MetaMask.

---

### 5.5 Copy Contract Details

After deployment:

1. In Remix, under **Deployed Contracts**:
    - Copy the **contract address**.
2. Go to:

```
certificate-dapp/src/scdata/
```

### Update files:

### 1) deployed_addresses.json

Replace with:

```
{
  "CertModule#Cert":"YOUR_CONTRACT_ADDRESS"
}
```

Paste your contract address.

---

### 2) Cert.json

1. In Remix:
    - Go to **Compilation Details**.
    - Copy the **ABI**.
2. Open:

```
src/scdata/Cert.json
```

1. Replace its contents with the ABI.

---

## Step 6: Start the Frontend

In the project folder:

```
npm run dev
```

You’ll see something like:

```
Local: http://localhost:5173
```

Open that URL in your browser.

---

## Step 7: Connect MetaMask

1. Open the app in browser.
2. Click **Connect Wallet**.
3. Select MetaMask.
4. Approve the connection.

Make sure:

- Network = **Sepolia**
- Account = **same one used to deploy contract** (admin)

---

## Step 8: Test the DApp

### Issue Certificate (Admin only)

1. Go to **Issue Certificate** page.
2. Fill the form.
3. Click **Issue**.
4. Confirm transaction in MetaMask.

---

### View Certificate

1. Go to **View Certificate**.
2. Enter certificate ID.
3. Click **View**.
