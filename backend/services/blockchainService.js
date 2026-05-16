const crypto = require('crypto');

/**
 * Simulated Blockchain Ledger
 * In production, replace with real Ethereum/Web3 calls.
 * This provides a local, tamper-proof hash ledger.
 */
class BlockchainLedger {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    // Genesis block
    this.chain.push(this.createBlock('0', 'Genesis Block'));
  }

  createBlock(previousHash, data) {
    const block = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      data: data,
      previousHash: previousHash,
      hash: '',
      nonce: 0
    };
    block.hash = this.calculateHash(block);
    return block;
  }

  calculateHash(block) {
    return crypto
      .createHash('sha256')
      .update(
        block.index +
        block.timestamp +
        JSON.stringify(block.data) +
        block.previousHash +
        block.nonce
      )
      .digest('hex');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addCertificate(certificateId, certHash, issuer) {
    const data = {
      certificateId,
      certHash,
      issuer,
      action: 'ISSUE_CERTIFICATE'
    };

    const previousHash = this.getLatestBlock().hash;
    const newBlock = this.createBlock(previousHash, data);
    this.chain.push(newBlock);

    // Return a simulated transaction hash
    const txHash = '0x' + crypto
      .createHash('sha256')
      .update(newBlock.hash + Date.now().toString())
      .digest('hex');

    return {
      transactionHash: txHash,
      blockIndex: newBlock.index,
      blockHash: newBlock.hash,
      timestamp: newBlock.timestamp
    };
  }

  verifyCertificate(certificateId, certHash) {
    for (let i = this.chain.length - 1; i >= 1; i--) {
      const block = this.chain[i];
      if (
        block.data.certificateId === certificateId &&
        block.data.certHash === certHash
      ) {
        return {
          verified: true,
          blockIndex: block.index,
          blockHash: block.hash,
          timestamp: block.timestamp,
          issuer: block.data.issuer
        };
      }
    }
    return { verified: false };
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];
      if (current.previousHash !== previous.hash) return false;
      if (current.hash !== this.calculateHash(current)) return false;
    }
    return true;
  }

  getChainLength() {
    return this.chain.length;
  }

  getBlock(index) {
    return this.chain[index] || null;
  }
}

// Singleton instance
const ledger = new BlockchainLedger();

module.exports = ledger;
