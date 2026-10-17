import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Crop from './models/Crop.js';
import Order from './models/Order.js';
import Booking from './models/Booking.js';
import BlockchainService from './services/blockchainService.js';
import { memoryStore } from './config/db.js';

export const seedInitialDataIfEmpty = async () => {
  try {
    const hashedPassword = await bcrypt.hash('agriflow123', 10);

    // Initial Users
    const initialUsers = [
      {
        name: 'Ramesh Patil',
        email: 'farmer.patil@agriflow.ai',
        password: hashedPassword,
        role: 'farmer',
        phone: '+91 98220 11223',
        location: { address: 'Shirol, Kolhapur', city: 'Kolhapur', state: 'Maharashtra', lat: 16.75, lng: 74.45 },
        farmerProfile: { farmSizeAcres: 8, preferredCrops: ['Tomato', 'Sugarcane', 'Onion'], rating: 4.9, totalDeliveredTons: 120 }
      },
      {
        name: 'Suresh More',
        email: 'farmer.more@agriflow.ai',
        password: hashedPassword,
        role: 'farmer',
        phone: '+91 98221 44556',
        location: { address: 'Hatkanangale, Kolhapur', city: 'Kolhapur', state: 'Maharashtra', lat: 16.74, lng: 74.44 },
        farmerProfile: { farmSizeAcres: 12, preferredCrops: ['Soybean', 'Grapes'], rating: 4.8, totalDeliveredTons: 85 }
      },
      {
        name: 'Reliance Fresh Procurement Hub',
        email: 'buyer.reliance@agriflow.ai',
        password: hashedPassword,
        role: 'buyer',
        phone: '+91 99223 88990',
        location: { address: 'Market Yard Gultekdi, Pune', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
        buyerProfile: { businessType: 'Wholesale Retail Chain', gstin: '27AAACR1234F1Z5', rating: 4.95 }
      },
      {
        name: 'Kisan Agro Cold Logistics',
        email: 'transporter.maharashtra@agriflow.ai',
        password: hashedPassword,
        role: 'transporter',
        phone: '+91 98500 77889',
        location: { address: 'MIDC Gokul Shirgaon, Kolhapur', city: 'Kolhapur', state: 'Maharashtra', lat: 16.65, lng: 74.28 },
        transporterProfile: { vehicleType: 'Refrigerated Reefer Truck (10T)', vehicleNumber: 'MH-09-CV-9988', maxCapacityKg: 10000, currentLoadKg: 0, isAvailable: true }
      },
      {
        name: 'DYPCET Admin Desk',
        email: 'admin@agriflow.ai',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 98765 43210',
        location: { address: 'Kasaba Bawada, Kolhapur', city: 'Kolhapur', state: 'Maharashtra', lat: 16.71, lng: 74.25 }
      }
    ];

    let createdUsers = [];
    try {
      const count = await User.countDocuments();
      if (count === 0) {
        createdUsers = await User.insertMany(initialUsers);
        console.log(`✅ Seeded ${createdUsers.length} initial users into MongoDB.`);
      } else {
        createdUsers = await User.find();
      }
    } catch {
      // Memory Store population
      if (memoryStore.users.length === 0) {
        createdUsers = initialUsers.map((u, i) => ({
          _id: `mem_user_${i + 1}`,
          ...u
        }));
        memoryStore.users = [...createdUsers];
        console.log(`✅ Seeded ${createdUsers.length} users into Memory Store.`);
      } else {
        createdUsers = memoryStore.users;
      }
    }

    const farmer1 = createdUsers.find(u => u.email === 'farmer.patil@agriflow.ai') || createdUsers[0];
    const farmer2 = createdUsers.find(u => u.email === 'farmer.more@agriflow.ai') || createdUsers[1];
    const buyer = createdUsers.find(u => u.email === 'buyer.reliance@agriflow.ai') || createdUsers[2];
    const transporter = createdUsers.find(u => u.email === 'transporter.maharashtra@agriflow.ai') || createdUsers[3];

    // Initial Crops
    const initialCrops = [
      {
        farmerId: farmer1._id,
        farmerName: farmer1.name,
        farmerPhone: farmer1.phone,
        cropName: 'Tomato (Hybrid Red)',
        variety: 'Abhinav Hybrid F1',
        category: 'vegetable',
        status: 'pre_harvest',
        totalQuantityKg: 4500,
        availableQuantityKg: 3200,
        pricePerKg: 28,
        qualityGrade: 'Grade A (Export/Premium)',
        expectedHarvestDate: new Date(Date.now() + 4 * 86400000),
        estimatedShelfLifeDays: 8,
        storageCondition: 'ambient',
        location: { village: 'Shirol', taluka: 'Shirol', district: 'Kolhapur', state: 'Maharashtra', lat: 16.75, lng: 74.45 },
        description: 'Pesticide controlled export grade firm hybrid red tomatoes with 8 days post-harvest shelf life.'
      },
      {
        farmerId: farmer1._id,
        farmerName: farmer1.name,
        farmerPhone: farmer1.phone,
        cropName: 'Nashik Red Onion',
        variety: 'Garwa / Phule Samarth',
        category: 'vegetable',
        status: 'harvested',
        actualHarvestDate: new Date(Date.now() - 2 * 86400000),
        totalQuantityKg: 8000,
        availableQuantityKg: 7500,
        pricePerKg: 34,
        qualityGrade: 'Grade A (Export/Premium)',
        expectedHarvestDate: new Date(Date.now() - 2 * 86400000),
        estimatedShelfLifeDays: 60,
        storageCondition: 'ventilated_dry',
        location: { village: 'Shirol', taluka: 'Shirol', district: 'Kolhapur', state: 'Maharashtra', lat: 16.75, lng: 74.45 },
        description: 'Dry cured premium medium-to-large size red onions with thick skin and high pungency.'
      },
      {
        farmerId: farmer2._id,
        farmerName: farmer2.name,
        farmerPhone: farmer2.phone,
        cropName: 'Tas-A-Ganesh Grapes',
        variety: 'Thomson Seedless Clone',
        category: 'fruit',
        status: 'harvested',
        actualHarvestDate: new Date(Date.now() - 6 * 86400000), // Aged harvest: critical perishability
        totalQuantityKg: 2000,
        availableQuantityKg: 1800,
        pricePerKg: 70,
        qualityGrade: 'Grade B (Standard Market)',
        expectedHarvestDate: new Date(Date.now() - 6 * 86400000),
        estimatedShelfLifeDays: 7, // 1 day remaining! Triggers Wastage Prevention Agent
        storageCondition: 'cold_storage',
        location: { village: 'Hatkanangale', taluka: 'Hatkanangale', district: 'Kolhapur', state: 'Maharashtra', lat: 16.74, lng: 74.44 },
        description: 'Sweet berry table grapes. Close to shelf-life threshold, discount available for immediate bulk procurement.'
      },
      {
        farmerId: farmer2._id,
        farmerName: farmer2.name,
        farmerPhone: farmer2.phone,
        cropName: 'Sugarcane (Co 86032)',
        variety: 'Nira Wonder',
        category: 'cash_crop',
        status: 'pre_harvest',
        totalQuantityKg: 50000,
        availableQuantityKg: 50000,
        pricePerKg: 3.4,
        qualityGrade: 'Grade A (Export/Premium)',
        expectedHarvestDate: new Date(Date.now() + 20 * 86400000),
        estimatedShelfLifeDays: 14,
        storageCondition: 'ambient',
        location: { village: 'Hatkanangale', taluka: 'Hatkanangale', district: 'Kolhapur', state: 'Maharashtra', lat: 16.74, lng: 74.44 },
        description: 'High brix content sugarcane suitable for nearby sugar cooperative factories and jaggery units.'
      }
    ];

    let createdCrops = [];
    try {
      const cropCount = await Crop.countDocuments();
      if (cropCount === 0) {
        createdCrops = await Crop.insertMany(initialCrops);
        console.log(`✅ Seeded ${createdCrops.length} crops into MongoDB.`);
      } else {
        createdCrops = await Crop.find();
      }
    } catch {
      if (memoryStore.crops.length === 0) {
        createdCrops = initialCrops.map((c, i) => ({
          _id: `mem_crop_${i + 1}`,
          ...c,
          createdAt: new Date()
        }));
        memoryStore.crops = [...createdCrops];
        console.log(`✅ Seeded ${createdCrops.length} crops into Memory Store.`);
      } else {
        createdCrops = memoryStore.crops;
      }
    }

    // Seed Sample Booking & Blockchain Event
    if (createdCrops.length > 0 && buyer) {
      const sampleBooking = {
        cropId: createdCrops[0]._id,
        farmerId: farmer1._id,
        buyerId: buyer._id,
        buyerName: buyer.name,
        cropName: createdCrops[0].cropName,
        bookedQuantityKg: 1300,
        agreedPricePerKg: createdCrops[0].pricePerKg,
        totalAmount: 1300 * createdCrops[0].pricePerKg,
        status: 'confirmed',
        advancePaymentAmount: 7280,
        expectedFulfillmentDate: new Date(Date.now() + 4 * 86400000),
        notes: 'Pre-harvest agreement with 20% advance locked.',
        blockchainHash: '0x8f2d5930b809424c883196f1d2e1b1d1e44208e9a263158c35b0d62734efaa03'
      };

      try {
        const bkCount = await Booking.countDocuments();
        if (bkCount === 0) {
          await Booking.create(sampleBooking);
        }
      } catch {
        if (memoryStore.bookings.length === 0) {
          memoryStore.bookings.push({ _id: 'mem_bk_sample_1', ...sampleBooking, createdAt: new Date() });
        }
      }

      // Seed Initial Blockchain Blocks
      await BlockchainService.recordEvent('HARVEST_CERTIFICATION', {
        cropId: createdCrops[0]._id.toString(),
        cropName: createdCrops[0].cropName,
        farmerId: farmer1._id.toString(),
        farmerName: farmer1.name,
        quantityKg: createdCrops[0].totalQuantityKg,
        qualityGrade: createdCrops[0].qualityGrade,
        location: 'Kolhapur, Maharashtra',
        customNotes: 'Certified crop batch genesis harvest validation.'
      });
    }

    console.log('🌾 AgriFlow AI demo seeds successfully initialized.');
  } catch (err) {
    console.warn(`Seed initial data warning: ${err.message}`);
  }
};
