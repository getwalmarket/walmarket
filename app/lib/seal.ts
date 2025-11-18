/**
 * Seal Integration Utilities
 *
 * Provides encryption, decryption, and access control functionality
 * using Mysten Labs' Seal framework for Walrus storage.
 *
 * Note: This file uses type casting (any) as a temporary workaround for
 * type compatibility issues between @mysten/seal and @mysten/sui SDKs.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';

// Seal configuration types
export interface ServerConfig {
  objectId: string;
  weight: number;
  apiKeyName?: string;
  apiKey?: string;
}

export interface SealConfig {
  suiClient: SuiClient;
  serverConfigs: ServerConfig[]; // Seal key server configurations
  verifyKeyServers?: boolean;
}

export interface EncryptOptions {
  data: Uint8Array;
  threshold: number;
  packageId: string;
  policyId: string;
}

export interface DecryptOptions {
  encryptedData: Uint8Array;
  sessionKey: unknown; // SessionKey from Seal SDK
  txBytes?: Uint8Array;
}

/**
 * Initialize Seal client with configuration
 *
 * Note: Type casting required due to version mismatch between
 * @mysten/sui and @mysten/seal SDK types
 */
export async function initializeSealClient(config: SealConfig): Promise<SealClient> {
  const client = new SealClient({
    suiClient: config.suiClient,
    serverConfigs: config.serverConfigs,
    verifyKeyServers: config.verifyKeyServers ?? true,
  } as any); // Type compatibility workaround for Seal SDK

  return client;
}

/**
 * Encrypt oracle evidence data for premium access
 *
 * @param client - Initialized Seal client
 * @param options - Encryption options including data and policy
 * @returns Encrypted blob data
 */
export async function encryptOracleEvidence(
  client: SealClient,
  options: EncryptOptions
): Promise<Uint8Array> {
  const { encryptedObject } = await client.encrypt({
    threshold: options.threshold,
    packageId: options.packageId,
    id: options.policyId,
    data: options.data,
  });

  return encryptedObject;
}

/**
 * Decrypt oracle evidence for premium subscribers
 *
 * @param client - Initialized Seal client
 * @param options - Decryption options including encrypted data and session key
 * @returns Decrypted blob data
 */
export async function decryptOracleEvidence(
  client: SealClient,
  options: DecryptOptions
): Promise<Uint8Array> {
  const decryptedData = await client.decrypt({
    data: options.encryptedData,
    sessionKey: options.sessionKey as any, // SessionKey type from Seal SDK
    txBytes: options.txBytes as any, // Optional txBytes
  } as any); // Type compatibility workaround

  return decryptedData;
}

/**
 * Upload encrypted data to Walrus and get blob ID
 * This is a placeholder - actual implementation would use Walrus SDK
 */
export async function uploadToWalrus(_data: Uint8Array): Promise<string> {
  // TODO: Implement actual Walrus upload
  // For now, return a mock blob ID
  console.warn('Walrus upload not implemented - using mock blob ID');
  return 'mock-blob-id-' + Date.now();
}

/**
 * Fetch encrypted blob from Walrus
 * This is a placeholder - actual implementation would use Walrus SDK
 */
export async function fetchFromWalrus(_blobId: string): Promise<Uint8Array> {
  // TODO: Implement actual Walrus fetch
  console.warn('Walrus fetch not implemented');
  throw new Error('Walrus fetch not yet implemented');
}

/**
 * Helper to convert string to Uint8Array for encryption
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Helper to convert Uint8Array to string after decryption
 */
export function uint8ArrayToString(arr: Uint8Array): string {
  return new TextDecoder().decode(arr);
}

/**
 * Create access control policy on Sui for a market
 * This would interact with the seal_access Move module
 */
export interface AccessPolicy {
  marketId: string;
  requiresPremium: boolean;
  encryptedBlobId: string;
  publicBlobId: string;
  sealPackageId: string;
  sealPolicyId: string;
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(
  _suiClient: SuiClient,
  _userAddress: string,
  _accessRegistryId: string
): Promise<boolean> {
  try {
    // TODO: Call the get_user_tier view function
    // const result = await suiClient.devInspectTransactionBlock({
    //   transactionBlock: {
    //     kind: 'moveCall',
    //     target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::seal_access::get_user_tier`,
    //     arguments: [accessRegistryId, userAddress],
    //   },
    //   sender: userAddress,
    // });

    // Parse result and check if tier >= 1 (Premium)
    // This is a simplified version - actual implementation would parse the result properly
    return true; // Placeholder
  } catch (error) {
    console.error('Error checking premium access:', error);
    return false;
  }
}

/**
 * Market data interface
 */
export interface MarketData {
  requires_premium_access?: boolean;
  encrypted_evidence_blob_id?: string;
  oracle_evidence_blob_id?: string;
}

/**
 * Parse encrypted evidence blob ID from market data
 */
export function getEncryptedBlobId(market: MarketData): string | null {
  if (market.requires_premium_access && market.encrypted_evidence_blob_id) {
    return market.encrypted_evidence_blob_id;
  }
  return null;
}

/**
 * Get public outcome blob ID (always accessible)
 */
export function getPublicBlobId(market: MarketData): string {
  return market.oracle_evidence_blob_id || '';
}
