module walmarket::market {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;
    use walmarket::usdt::USDT;

    /// Market struct representing a prediction market
    public struct Market has key, store {
        id: UID,
        /// Market title/question
        title: vector<u8>,
        /// Market description
        description: vector<u8>,
        /// Category (Crypto, Technology, DeFi, etc.)
        category: vector<u8>,
        /// End timestamp (in milliseconds)
        end_date: u64,
        /// Total volume in YES position (in USDT)
        yes_pool: Balance<USDT>,
        /// Total volume in NO position (in USDT)
        no_pool: Balance<USDT>,
        /// Market creator address
        creator: address,
        /// Market status: 0 = Active, 1 = Resolved YES, 2 = Resolved NO, 3 = Cancelled
        status: u8,
        /// Resolution outcome (0 = pending, 1 = YES, 2 = NO)
        outcome: u8,
        /// Walrus blob ID for market metadata (description, images, etc.)
        walrus_metadata_blob_id: vector<u8>,
        /// Walrus blob ID for oracle evidence (AI reasoning, sources, etc.)
        oracle_evidence_blob_id: vector<u8>,
        /// Oracle reporter address (TEE attested)
        oracle_reporter: address,
        /// Seal-encrypted premium evidence blob ID (optional)
        encrypted_evidence_blob_id: vector<u8>,
        /// Whether this market requires premium access for full evidence
        requires_premium_access: bool,
        /// Seal policy ID for access control (if premium)
        seal_policy_id: vector<u8>,
    }

    /// Position struct representing a user's bet
    public struct Position has key, store {
        id: UID,
        /// Market ID
        market_id: address,
        /// Owner of this position
        owner: address,
        /// Prediction: true = YES, false = NO
        prediction: bool,
        /// Amount staked (in USDT with 6 decimals)
        amount: u64,
        /// Timestamp when position was created
        created_at: u64,
    }

    /// Market registry to track all markets
    public struct MarketRegistry has key {
        id: UID,
        /// Counter for total markets created
        market_count: u64,
        /// Mapping of market IDs for enumeration
        market_ids: Table<u64, address>,
    }

    // ===== Events =====

    public struct MarketCreated has copy, drop {
        market_id: address,
        creator: address,
        title: vector<u8>,
        end_date: u64,
        walrus_blob_id: vector<u8>,
    }

    public struct BetPlaced has copy, drop {
        market_id: address,
        user: address,
        prediction: bool,
        amount: u64,
    }

    public struct MarketResolved has copy, drop {
        market_id: address,
        outcome: u8,
        oracle_reporter: address,
        oracle_evidence_blob_id: vector<u8>,
    }

    public struct WinningsClaimed has copy, drop {
        market_id: address,
        user: address,
        payout: u64,
    }

    // ===== Error Codes =====

    const E_MARKET_ENDED: u64 = 1;
    const E_MARKET_NOT_ENDED: u64 = 2;
    const E_MARKET_ALREADY_RESOLVED: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_NOT_CREATOR: u64 = 5;
    const E_INVALID_OUTCOME: u64 = 6;
    const E_WRONG_MARKET: u64 = 7;
    const E_ALREADY_CLAIMED: u64 = 8;
    const E_INVALID_BLOB_ID: u64 = 9;

    // ===== Initialization =====

    /// Initialize the module by creating a MarketRegistry
    fun init(ctx: &mut TxContext) {
        let registry = MarketRegistry {
            id: object::new(ctx),
            market_count: 0,
            market_ids: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create a new prediction market with Walrus metadata storage
    public entry fun create_market(
        registry: &mut MarketRegistry,
        title: vector<u8>,
        description: vector<u8>,
        category: vector<u8>,
        end_date: u64,
        walrus_blob_id: vector<u8>, // Blob ID from Walrus where full metadata is stored
        ctx: &mut TxContext
    ) {
        // Validate blob ID is not empty
        assert!(vector::length(&walrus_blob_id) > 0, E_INVALID_BLOB_ID);

        let market_id = object::new(ctx);
        let market_address = object::uid_to_address(&market_id);

        let market = Market {
            id: market_id,
            title,
            description,
            category,
            end_date,
            yes_pool: balance::zero(),
            no_pool: balance::zero(),
            creator: tx_context::sender(ctx),
            status: 0, // Active
            outcome: 0, // Pending
            walrus_metadata_blob_id: walrus_blob_id,
            oracle_evidence_blob_id: vector::empty(),
            oracle_reporter: @0x0,
            encrypted_evidence_blob_id: vector::empty(),
            requires_premium_access: false,
            seal_policy_id: vector::empty(),
        };

        // Track market in registry
        table::add(&mut registry.market_ids, registry.market_count, market_address);
        registry.market_count = registry.market_count + 1;

        event::emit(MarketCreated {
            market_id: market_address,
            creator: tx_context::sender(ctx),
            title: market.title,
            end_date,
            walrus_blob_id: market.walrus_metadata_blob_id,
        });

        transfer::share_object(market);
    }

    /// Place a bet on a market using USDT
    public entry fun place_bet(
        market: &mut Market,
        prediction: bool, // true = YES, false = NO
        payment: Coin<USDT>,
        ctx: &mut TxContext
    ) {
        // Market must be active
        assert!(market.status == 0, E_MARKET_ALREADY_RESOLVED);

        let amount = coin::value(&payment);
        assert!(amount > 0, E_INVALID_AMOUNT);

        // Add to appropriate pool
        let balance = coin::into_balance(payment);
        if (prediction) {
            balance::join(&mut market.yes_pool, balance);
        } else {
            balance::join(&mut market.no_pool, balance);
        };

        // Create position NFT for the user
        let position = Position {
            id: object::new(ctx),
            market_id: object::uid_to_address(&market.id),
            owner: tx_context::sender(ctx),
            prediction,
            amount,
            created_at: tx_context::epoch(ctx),
        };

        event::emit(BetPlaced {
            market_id: object::uid_to_address(&market.id),
            user: tx_context::sender(ctx),
            prediction,
            amount,
        });

        transfer::transfer(position, tx_context::sender(ctx));
    }

    /// Resolve a market with oracle evidence stored on Walrus
    /// Supports both public and Seal-encrypted evidence
    public entry fun resolve_market(
        market: &mut Market,
        outcome: u8, // 1 = YES, 2 = NO
        oracle_evidence_blob_id: vector<u8>, // Public outcome blob ID
        ctx: &mut TxContext
    ) {
        // Only creator can resolve for now (TODO: add TEE oracle verification)
        assert!(tx_context::sender(ctx) == market.creator, E_NOT_CREATOR);
        assert!(market.status == 0, E_MARKET_ALREADY_RESOLVED);
        assert!(outcome == 1 || outcome == 2, E_INVALID_OUTCOME);
        assert!(vector::length(&oracle_evidence_blob_id) > 0, E_INVALID_BLOB_ID);

        market.status = outcome;
        market.outcome = outcome;
        market.oracle_evidence_blob_id = oracle_evidence_blob_id;
        market.oracle_reporter = tx_context::sender(ctx);

        event::emit(MarketResolved {
            market_id: object::uid_to_address(&market.id),
            outcome,
            oracle_reporter: market.oracle_reporter,
            oracle_evidence_blob_id: market.oracle_evidence_blob_id,
        });
    }

    /// Resolve market with premium Seal-encrypted evidence
    /// This stores encrypted blob separately for premium subscribers
    public entry fun resolve_market_with_premium(
        market: &mut Market,
        outcome: u8, // 1 = YES, 2 = NO
        public_outcome_blob_id: vector<u8>, // Public outcome only
        encrypted_evidence_blob_id: vector<u8>, // Seal-encrypted full evidence
        seal_policy_id: vector<u8>, // Seal policy for access control
        ctx: &mut TxContext
    ) {
        // Only creator can resolve (TODO: add TEE oracle verification)
        assert!(tx_context::sender(ctx) == market.creator, E_NOT_CREATOR);
        assert!(market.status == 0, E_MARKET_ALREADY_RESOLVED);
        assert!(outcome == 1 || outcome == 2, E_INVALID_OUTCOME);
        assert!(vector::length(&public_outcome_blob_id) > 0, E_INVALID_BLOB_ID);
        assert!(vector::length(&encrypted_evidence_blob_id) > 0, E_INVALID_BLOB_ID);
        assert!(vector::length(&seal_policy_id) > 0, E_INVALID_BLOB_ID);

        market.status = outcome;
        market.outcome = outcome;
        market.oracle_evidence_blob_id = public_outcome_blob_id;
        market.encrypted_evidence_blob_id = encrypted_evidence_blob_id;
        market.oracle_reporter = tx_context::sender(ctx);
        market.requires_premium_access = true;
        market.seal_policy_id = seal_policy_id;

        event::emit(MarketResolved {
            market_id: object::uid_to_address(&market.id),
            outcome,
            oracle_reporter: market.oracle_reporter,
            oracle_evidence_blob_id: market.oracle_evidence_blob_id,
        });
    }

    /// Claim winnings from a resolved market
    public entry fun claim_winnings(
        market: &mut Market,
        position: Position,
        ctx: &mut TxContext
    ) {
        assert!(market.status != 0, E_MARKET_NOT_ENDED);

        let Position { id, market_id, owner, prediction, amount, created_at: _ } = position;

        // Verify position belongs to this market
        assert!(market_id == object::uid_to_address(&market.id), E_WRONG_MARKET);

        object::delete(id);

        // Check if position won
        let won = (market.outcome == 1 && prediction) || (market.outcome == 2 && !prediction);

        if (won) {
            // Calculate winnings based on pool ratio
            let yes_amount = balance::value(&market.yes_pool);
            let no_amount = balance::value(&market.no_pool);
            let total_pool = yes_amount + no_amount;

            let winning_pool = if (prediction) { &mut market.yes_pool } else { &mut market.no_pool };
            let losing_pool = if (prediction) { &mut market.no_pool } else { &mut market.yes_pool };

            // Calculate proportional winnings
            let payout = if (balance::value(winning_pool) > 0) {
                (amount * total_pool) / balance::value(winning_pool)
            } else {
                amount
            };

            // Transfer winnings
            let mut payout_balance = balance::split(winning_pool, amount);
            if (balance::value(losing_pool) > 0 && payout > amount) {
                let profit = payout - amount;
                let available_profit = balance::value(losing_pool);
                let actual_profit = if (profit > available_profit) { available_profit } else { profit };
                if (actual_profit > 0) {
                    let profit_balance = balance::split(losing_pool, actual_profit);
                    balance::join(&mut payout_balance, profit_balance);
                };
            };

            let final_payout = balance::value(&payout_balance);
            let payout_coin = coin::from_balance(payout_balance, ctx);
            transfer::public_transfer(payout_coin, owner);

            event::emit(WinningsClaimed {
                market_id: market_id,
                user: owner,
                payout: final_payout,
            });
        }
        // If lost, position is simply burned
    }

    // ===== View Functions =====

    /// Get market details
    public fun get_market_status(market: &Market): u8 {
        market.status
    }

    public fun get_yes_pool(market: &Market): u64 {
        balance::value(&market.yes_pool)
    }

    public fun get_no_pool(market: &Market): u64 {
        balance::value(&market.no_pool)
    }

    public fun get_walrus_metadata_blob_id(market: &Market): vector<u8> {
        market.walrus_metadata_blob_id
    }

    public fun get_oracle_evidence_blob_id(market: &Market): vector<u8> {
        market.oracle_evidence_blob_id
    }

    public fun get_total_markets(registry: &MarketRegistry): u64 {
        registry.market_count
    }

    public fun get_market_by_index(registry: &MarketRegistry, index: u64): address {
        *table::borrow(&registry.market_ids, index)
    }

    public fun requires_premium_access(market: &Market): bool {
        market.requires_premium_access
    }

    public fun get_encrypted_evidence_blob_id(market: &Market): vector<u8> {
        market.encrypted_evidence_blob_id
    }

    public fun get_seal_policy_id(market: &Market): vector<u8> {
        market.seal_policy_id
    }
}
