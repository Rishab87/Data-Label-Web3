# Data-Label-Web3

This is a data-labelling platform which leverages blockchain to make payments. A user can upload his images and other people can select the best image they like. User will have to pay few sols to upload their images for review and workers who will vote will get some sols for selecting the best images they like. To test it select a wallet which supports solana and switch to solana devnet in your wallet

#### To run this project on your local machines:

```bash
npm install
```

- frontend:
```bash
npm run dev
```
- backend:
```bash
npm start
```

#### In backend create a .env file and add all keys or urls  , refer to .env.example , add private key of wallet you want to treat as admin inside .env in frontend


Tech Stack:
- Frontend: Next.js
- Backend: Express.js
- ORM: Prisma
- DB: postgresql
