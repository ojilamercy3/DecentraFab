# DecentraFab

A blockchain-based manufacturing coordination and quality assurance platform that ensures traceability, compliance, and fairness in global industrial production — all on-chain.

---

## Overview

DecentraFab consists of ten main smart contracts that collectively form a transparent, decentralized ecosystem for industrial manufacturing and logistics:

1. **Factory Registry Contract** – Registers and verifies manufacturers with metadata and certifications.
2. **Part NFT Contract** – Mints and manages digital twins of manufactured components.
3. **Production Order Contract** – Automates job orders, delivery timelines, and penalties.
4. **QA Validator Contract** – Coordinates decentralized quality assurance and stake-based verification.
5. **Reputation Contract** – Tracks performance scores for factories and validators.
6. **Escrow Payment Contract** – Locks and releases payments based on quality and delivery milestones.
7. **Dispute Resolution Contract** – On-chain dispute resolution governed by a DAO.
8. **Compliance Certification Contract** – Verifies ISO and industry compliance on-chain.
9. **Telemetry Oracle Adapter** – Integrates IoT machine data for real-time production validation.
10. **Reward & Penalty Contract** – Automates incentives and enforces accountability through slashing.

---

## Features

- **Verifiable manufacturer registry** with metadata and trust scores  
- **Tokenized components** with lifecycle and ownership tracking  
- **Production contracts** with built-in delivery enforcement  
- **Decentralized quality inspection** with validator staking  
- **Reputation scoring** based on output, timeliness, and audits  
- **Escrow smart contracts** tied to performance checkpoints  
- **DAO-governed dispute resolution**  
- **On-chain certification validation** for standards compliance  
- **Telemetry integration** from machines to blockchain  
- **Incentives and slashing** mechanisms for ecosystem accountability  

---

## Smart Contracts

### Factory Registry Contract
- Add and update registered factories
- Associate certifications and metadata
- Controlled by admin or DAO governance

### Part NFT Contract
- Mint NFTs representing each component
- Link to production order and QA results
- Supports batch operations and ownership transfers

### Production Order Contract
- Create production jobs with specs and deadlines
- Track fulfillment and progress status
- Apply time-based penalties for late deliveries

### QA Validator Contract
- Validators stake tokens to inspect outputs
- Accept/reject parts based on standards
- Slashing for dishonest or missed validations

### Reputation Contract
- Calculate scores based on audits, delivery, and feedback
- On-chain history of factory and validator performance
- Dynamic updates and public transparency

### Escrow Payment Contract
- Hold buyer funds during production
- Release funds upon QA and delivery confirmation
- Penalty deductions for failures or delays

### Dispute Resolution Contract
- DAO-based voting system for disputes
- Involves stake-weighted jury or expert committee
- Resolves QA or delivery failures fairly and transparently

### Compliance Certification Contract
- Tracks ISO, RoHS, and other industry certifications
- Allows auditors to issue or revoke credentials
- Enables compliance-based contract filtering

### Telemetry Oracle Adapter
- Integrates real-time factory telemetry (e.g. machine hours)
- Verifies actual production processes occurred
- Provides data integrity proofs to QA contracts

### Reward & Penalty Contract
- Issues bonuses for exceptional output
- Enforces penalties and token slashing for non-compliance
- Ties into reputation and validator systems

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/decentrafab.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

---

## Usage

Each smart contract is modular and self-contained, but they interact to form a cohesive manufacturing coordination platform. Refer to the /contracts directory for source code and the /docs directory for detailed usage instructions and function descriptions.

## License

MIT License