// SPDX-License-Identifier: MIT
module walmarket::usdt {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url;

    /// One-time witness for the USDT token
    public struct USDT has drop {}

    /// Module initializer - called once when the module is published
    #[allow(deprecated_usage)]
    fun init(witness: USDT, ctx: &mut TxContext) {
        // Create the USDT currency with 6 decimals (like real USDT)
        let (treasury, metadata) = coin::create_currency(
            witness,
            6, // decimals
            b"USDT", // symbol
            b"Tether USD", // name
            b"Test USDT token for Walmarket prediction markets", // description
            option::some(url::new_unsafe_from_bytes(b"https://walmarket.fun/usdt.png")), // icon URL
            ctx
        );

        // Freeze the metadata so it cannot be changed
        transfer::public_freeze_object(metadata);

        // Transfer the treasury capability to the deployer
        // This allows minting new tokens
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }

    /// Mint new USDT tokens (only treasury cap holder can call this)
    public fun mint(
        treasury: &mut TreasuryCap<USDT>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    /// Burn USDT tokens
    public fun burn(
        treasury: &mut TreasuryCap<USDT>,
        coin: Coin<USDT>
    ) {
        coin::burn(treasury, coin);
    }
}
