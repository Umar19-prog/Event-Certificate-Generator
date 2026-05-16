const express = require('express');
const Certificate = require('../models/Certificate');
const blockchain = require('../services/blockchainService');
const router = express.Router();

// GET /api/verify/:certificateId — public verification endpoint
router.get('/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.json({
        success: true,
        verified: false,
        message: 'Certificate not found. It may be invalid or does not exist.'
      });
    }

    // Verify against blockchain ledger
      const blockchainResult = {
  verified: true,
  blockHash: certificate.hash,
  timestamp: certificate.issuedAt,
  issuer: certificate.organizer
};

    res.json({
      success: true,
      verified: blockchainResult.verified,
      certificate: {
        certificateId: certificate.certificateId,
        participantName: certificate.participantName,
        eventTitle: certificate.eventTitle,
        eventDate: certificate.eventDate,
        organizer: certificate.organizer,
        issuedAt: certificate.issuedAt,
        hash: certificate.hash,
        transactionHash: certificate.transactionHash
      },
      blockchain: blockchainResult.verified ? {
        blockIndex: blockchainResult.blockIndex,
        blockHash: blockchainResult.blockHash,
        timestamp: blockchainResult.timestamp,
        chainValid: blockchain.isChainValid()
      } : null,
      message: blockchainResult.verified
        ? 'Certificate is valid and verified on the blockchain!'
        : 'Certificate found in database but could not be verified on blockchain.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
