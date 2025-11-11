module walmarket::market {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;

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
        /// Total volume in YES position
        yes_pool: Balance<SUI>,
        /// Total volume in NO position
        no_pool: Balance<SUI>,
        /// Market creator address
        creator: address,
        /// Market status: 0 = Active, 1 = Resolved YES, 2 = Resolved NO, 3 = Cancelled
        status: u8,
        /// Resolution outcome (0 = pending, 1 = YES, 2 = NO)
        outcome: u8,
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
        /// Amount staked
        amount: u64,
        /// Timestamp when position was created
        created_at: u64,
    }

    /// Market registry to track all markets
    public struct MarketRegistry has key {
        id: UID,
        /// Counter for total markets created
        market_count: u64,
    }

    // ===== Events =====

    public struct MarketCreated has copy, drop {
        market_id: address,
        creator: address,
        title: vector<u8>,
        end_date: u64,
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
    }

    // ===== Error Codes =====

    const E_MARKET_ENDED: u64 = 1;
    const E_MARKET_NOT_ENDED: u64 = 2;
    const E_MARKET_ALREADY_RESOLVED: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_NOT_CREATOR: u64 = 5;
    const E_INVALID_OUTCOME: u64 = 6;

    // ===== Initialization =====

    /// Initialize the module by creating a MarketRegistry
    fun init(ctx: &mut TxContext) {
        let registry = MarketRegistry {
            id: object::new(ctx),
            market_count: 0,
        };
        transfer::share_object(registry);
    }

    // ===== Public Functions =====

    /// Create a new prediction market
    public entry fun create_market(
        _registry: &mut MarketRegistry,
        title: vector<u8>,
        description: vector<u8>,
        category: vector<u8>,
        end_date: u64,
        ctx: &mut TxContext
    ) {
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
        };

        event::emit(MarketCreated {
            market_id: market_address,
            creator: tx_context::sender(ctx),
            title: market.title,
            end_date,
        });

        transfer::share_object(market);
    }

    /// Place a bet on a market
    public entry fun place_bet(
        market: &mut Market,
        prediction: bool, // true = YES, false = NO
        payment: Coin<SUI>,
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

    /// Resolve a market (only creator or oracle can call)
    public entry fun resolve_market(
        market: &mut Market,
        outcome: u8, // 1 = YES, 2 = NO
        ctx: &mut TxContext
    ) {
        // Only creator can resolve for now (will add oracle logic later)
        assert!(tx_context::sender(ctx) == market.creator, E_NOT_CREATOR);
        assert!(market.status == 0, E_MARKET_ALREADY_RESOLVED);
        assert!(outcome == 1 || outcome == 2, E_INVALID_OUTCOME);

        market.status = outcome;
        market.outcome = outcome;

        event::emit(MarketResolved {
            market_id: object::uid_to_address(&market.id),
            outcome,
        });
    }

    /// Claim winnings from a resolved market
    public entry fun claim_winnings(
        market: &mut Market,
        position: Position,
        ctx: &mut TxContext
    ) {
        assert!(market.status != 0, E_MARKET_NOT_ENDED);

        let Position { id, market_id: _, owner, prediction, amount, created_at: _ } = position;
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
                let profit_balance = balance::split(losing_pool, profit);
                balance::join(&mut payout_balance, profit_balance);
            };

            let payout_coin = coin::from_balance(payout_balance, ctx);
            transfer::public_transfer(payout_coin, owner);
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
}
