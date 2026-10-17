import BlockchainBlock, { calculateHash } from '../models/BlockchainBlock.js';
import { memoryStore } from '../config/db.js';

class BlockchainService {
  constructor() {
    this.chain = [];
    this.initGenesisBlock();
  }

  async initGenesisBlock() {
    try {
      const existingGenesis = await BlockchainBlock.findOne({ index: 0 });
      if (!existingGenesis) {
        const genesisPayload = {
          system: 'AgriFlow AI Genesis Block',
          genesisDate: new Date().toISOString(),
          authorizedBy: 'DYPCET CSE (Data Science) Node'
        };
        const genesisHash = calculateHash(0, Date.now(), 'HARVEST_CERTIFICATION', genesisPayload, '0', 0);
        await BlockchainBlock.create({
          index: 0,
          eventType: 'HARVEST_CERTIFICATION',
          payload: genesisPayload,
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          hash: genesisHash,
          nonce: 0
        });
      }
    } catch {
      // Memory store fallback
      if (memoryStore.blocks.length === 0) {
        const genesisPayload = {
          system: 'AgriFlow AI Genesis Block',
          authorizedBy: 'DYPCET CSE (Data Science) Node'
        };
        const genesisHash = calculateHash(0, Date.now(), 'HARVEST_CERTIFICATION', genesisPayload, '0', 0);
        memoryStore.blocks.push({
          index: 0,
          eventType: 'HARVEST_CERTIFICATION',
          payload: genesisPayload,
          previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
          hash: genesisHash,
          createdAt: new Date()
        });
      }
    }
  }

  async getLatestBlock() {
    try {
      const block = await BlockchainBlock.findOne().sort({ index: -1 });
      if (block) return block;
    } catch {
      // fallback
    }
    return memoryStore.blocks[memoryStore.blocks.length - 1];
  }

  async recordEvent(eventType, payload) {
    const latestBlock = await this.getLatestBlock();
    const index = latestBlock ? latestBlock.index + 1 : 1;
    const previousHash = latestBlock ? latestBlock.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const timestamp = Date.now();
    const hash = calculateHash(index, timestamp, eventType, payload, previousHash, 0);

    const newBlockData = {
      index,
      timestamp: new Date(timestamp),
      eventType,
      payload,
      previousHash,
      hash,
      nonce: 0
    };

    try {
      const savedBlock = await BlockchainBlock.create(newBlockData);
      return savedBlock;
    } catch {
      memoryStore.blocks.push(newBlockData);
      return newBlockData;
    }
  }

  async getAllBlocks() {
    try {
      const blocks = await BlockchainBlock.find().sort({ index: 1 });
      if (blocks && blocks.length > 0) return blocks;
    } catch {
      // fallback
    }
    return memoryStore.blocks;
  }

  async verifyChainIntegrity() {
    const blocks = await this.getAllBlocks();
    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];

      if (current.previousHash !== previous.hash) {
        return { valid: false, brokenIndex: i, reason: 'Broken hash linkage' };
      }
    }
    return { valid: true, totalBlocks: blocks.length };
  }
}

export default new BlockchainService();
