module walmarket::seal_access {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::table::{Self, Table};

    /// Access tier for premium analytics
    /// 0 = Free (basic outcome only)
    /// 1 = Premium (full reasoning and sources)
    /// 2 = Enterprise (historical data + analytics)
    const ACCESS_TIER_FREE: u8 = 0;
    const ACCESS_TIER_PREMIUM: u8 = 1;
    const ACCESS_TIER_ENTERPRISE: u8 = 2;

    /// Premium access pass NFT
    /// Grants holder access to encrypted oracle evidence
    public struct PremiumAccessPass has key, store {
        id: UID,
        /// Owner address
        owner: address,
        /// Access tier level
        tier: u8,
        /// Expiration timestamp (0 = never expires)
        expires_at: u64,
        /// Creation timestamp
        created_at: u64,
    }

    /// Market access control configuration
    public struct MarketAccessControl has key {
        id: UID,
        /// Market ID this access control applies to
        market_id: address,
        /// Whether premium access is required for full evidence
        requires_premium: bool,
        /// Encrypted oracle evidence blob ID (Seal-encrypted)
        encrypted_evidence_blob_id: vector<u8>,
        /// Public outcome blob ID (not encrypted)
        public_outcome_blob_id: vector<u8>,
        /// Seal package ID for decryption policy
        seal_package_id: address,
        /// Seal policy object ID for access verification
        seal_policy_id: address,
    }

    /// Registry for tracking premium subscribers
    public struct AccessRegistry has key {
        id: UID,
        /// Mapping of user address to their access tier
        user_tiers: Table<address, u8>,
        /// Total premium subscribers
        premium_count: u64,
        /// Total enterprise subscribers
        enterprise_count: u64,
    }

    // ===== Events =====

    public struct AccessPassCreated has copy, drop {
        pass_id: address,
        owner: address,
        tier: u8,
        expires_at: u64,
    }

    public struct AccessControlConfigured has copy, drop {
        market_id: address,
        requires_premium: bool,
        encrypted_blob_id: vector<u8>,
        seal_policy_id: address,
    }

    public struct AccessGranted has copy, drop {
        user: address,
        market_id: address,
        tier: u8,
    }

    // ===== Error Codes =====

    const E_INSUFFICIENT_ACCESS: u64 = 100;
    const E_EXPIRED_PASS: u64 = 101;
    const E_INVALID_TIER: u64 = 102;
    const E_INVALID_SEAL_CONFIG: u64 = 103;

    // ===== Initialization =====

    /// Initialize the access control module
    fun init(ctx: &mut TxContext) {
        let registry = AccessRegistry {
            id: object::new(ctx),
            user_tiers: table::new(ctx),
            premium_count: 0,
            enterprise_count: 0,
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Issue a premium access pass (would be token-gated in production)
    public entry fun issue_access_pass(
        registry: &mut AccessRegistry,
        recipient: address,
        tier: u8,
        duration_days: u64, // 0 = lifetime
        ctx: &mut TxContext
    ) {
        // Validate tier
        assert!(tier <= ACCESS_TIER_ENTERPRISE, E_INVALID_TIER);

        let current_epoch = tx_context::epoch(ctx);
        let expires_at = if (duration_days == 0) {
            0 // Never expires
        } else {
            current_epoch + (duration_days * 86400000) // Convert days to milliseconds
        };

        let pass_id = object::new(ctx);
        let pass_address = object::uid_to_address(&pass_id);

        let pass = PremiumAccessPass {
            id: pass_id,
            owner: recipient,
            tier,
            expires_at,
            created_at: current_epoch,
        };

        // Update registry
        if (table::contains(&registry.user_tiers, recipient)) {
            let current_tier = table::borrow_mut(&mut registry.user_tiers, recipient);
            *current_tier = tier;
        } else {
            table::add(&mut registry.user_tiers, recipient, tier);
        };

        if (tier == ACCESS_TIER_PREMIUM) {
            registry.premium_count = registry.premium_count + 1;
        } else if (tier == ACCESS_TIER_ENTERPRISE) {
            registry.enterprise_count = registry.enterprise_count + 1;
        };

        event::emit(AccessPassCreated {
            pass_id: pass_address,
            owner: recipient,
            tier,
            expires_at,
        });

        transfer::transfer(pass, recipient);
    }

    /// Configure Seal-based access control for a market
    public entry fun configure_market_access(
        market_id: address,
        requires_premium: bool,
        encrypted_evidence_blob_id: vector<u8>,
        public_outcome_blob_id: vector<u8>,
        seal_package_id: address,
        seal_policy_id: address,
        ctx: &mut TxContext
    ) {
        // Validate Seal configuration
        assert!(seal_package_id != @0x0, E_INVALID_SEAL_CONFIG);
        assert!(seal_policy_id != @0x0, E_INVALID_SEAL_CONFIG);

        let access_control = MarketAccessControl {
            id: object::new(ctx),
            market_id,
            requires_premium,
            encrypted_evidence_blob_id,
            public_outcome_blob_id,
            seal_package_id,
            seal_policy_id,
        };

        event::emit(AccessControlConfigured {
            market_id,
            requires_premium,
            encrypted_blob_id: encrypted_evidence_blob_id,
            seal_policy_id,
        });

        transfer::share_object(access_control);
    }

    /// Verify user has access to premium content
    /// Returns the encrypted blob ID if user has access
    public fun verify_access(
        access_control: &MarketAccessControl,
        pass: &PremiumAccessPass,
        ctx: &TxContext
    ): vector<u8> {
        // Check if premium access is required
        if (!access_control.requires_premium) {
            return access_control.public_outcome_blob_id
        };

        // Verify pass ownership
        assert!(pass.owner == tx_context::sender(ctx), E_INSUFFICIENT_ACCESS);

        // Check expiration
        if (pass.expires_at > 0) {
            assert!(tx_context::epoch(ctx) < pass.expires_at, E_EXPIRED_PASS);
        };

        // Verify tier is sufficient (Premium or Enterprise)
        assert!(pass.tier >= ACCESS_TIER_PREMIUM, E_INSUFFICIENT_ACCESS);

        event::emit(AccessGranted {
            user: tx_context::sender(ctx),
            market_id: access_control.market_id,
            tier: pass.tier,
        });

        // Return encrypted evidence blob ID for Seal decryption
        access_control.encrypted_evidence_blob_id
    }

    /// Get public outcome (no authentication required)
    public fun get_public_outcome(
        access_control: &MarketAccessControl
    ): vector<u8> {
        access_control.public_outcome_blob_id
    }

    // ===== View Functions =====

    public fun get_user_tier(registry: &AccessRegistry, user: address): u8 {
        if (table::contains(&registry.user_tiers, user)) {
            *table::borrow(&registry.user_tiers, user)
        } else {
            ACCESS_TIER_FREE
        }
    }

    public fun get_premium_count(registry: &AccessRegistry): u64 {
        registry.premium_count
    }

    public fun get_enterprise_count(registry: &AccessRegistry): u64 {
        registry.enterprise_count
    }

    public fun is_premium_required(access_control: &MarketAccessControl): bool {
        access_control.requires_premium
    }

    public fun get_seal_policy_id(access_control: &MarketAccessControl): address {
        access_control.seal_policy_id
    }

    public fun get_pass_tier(pass: &PremiumAccessPass): u8 {
        pass.tier
    }

    public fun is_pass_expired(pass: &PremiumAccessPass, current_epoch: u64): bool {
        pass.expires_at > 0 && current_epoch >= pass.expires_at
    }
}
