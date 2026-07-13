CREATE OR REPLACE FUNCTION gacha.execute_pull(
    p_user_id uuid,
    p_event_id uuid,
    p_idempotency_key uuid,
    p_ip_address inet,
    p_user_agent text
) RETURNS TABLE (
    pull_id uuid,
    item_id uuid,
    item_name varchar,
    new_balance bigint
) AS $$
DECLARE
    v_event_cost int;
    v_event_name varchar;
    v_wallet_id uuid;
    v_balance bigint;
    v_new_balance bigint;
    v_last_sequence bigint;
    v_last_hash varchar(64);
    
    v_wallet_tx_id uuid := gen_random_uuid();
    v_pull_id uuid := gen_random_uuid();
    v_user_item_id uuid := gen_random_uuid();
    
    v_total_weight numeric;
    v_random_roll numeric;
    v_current_weight numeric := 0;
    
    v_selected_item_id uuid;
    v_selected_item_name varchar;
    v_item record;
BEGIN
    SELECT cost_per_pull, name INTO v_event_cost, v_event_name
    FROM gacha.events
    WHERE id = p_event_id AND status = 'active';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event tidak ditemukan atau tidak aktif';
    END IF;

    SELECT id, balance, last_ledger_hash 
    INTO v_wallet_id, v_balance, v_last_hash
    FROM wallet.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Wallet tidak ditemukan untuk user ini';
    END IF;

    SELECT COALESCE(MAX(sequence), 0) INTO v_last_sequence
    FROM wallet.wallet_transactions
    WHERE wallet_id = v_wallet_id;

    IF v_balance < v_event_cost THEN
        RAISE EXCEPTION 'Saldo poin tidak mencukupi untuk melakukan gacha';
    END IF;

    v_new_balance := v_balance - v_event_cost;

    SELECT SUM(drop_rate) INTO v_total_weight 
    FROM gacha.items 
    WHERE event_id = p_event_id AND is_active = true;
    
    IF v_total_weight IS NULL OR v_total_weight = 0 THEN
        RAISE EXCEPTION 'Tidak ada item aktif dalam event ini';
    END IF;

    v_random_roll := random() * v_total_weight;

    FOR v_item IN (
        SELECT id, name, drop_rate 
        FROM gacha.items 
        WHERE event_id = p_event_id AND is_active = true 
        ORDER BY id
    ) LOOP
        v_current_weight := v_current_weight + v_item.drop_rate;
        IF v_random_roll <= v_current_weight THEN
            v_selected_item_id := v_item.id;
            v_selected_item_name := v_item.name;
            EXIT;
        END IF;
    END LOOP;
    
    IF v_selected_item_id IS NULL THEN
        SELECT id, name INTO v_selected_item_id, v_selected_item_name
        FROM gacha.items 
        WHERE event_id = p_event_id AND is_active = true
        ORDER BY drop_rate DESC LIMIT 1;
    END IF;

    INSERT INTO wallet.wallet_transactions (
        id, wallet_id, user_id, sequence, type, direction, amount,
        balance_before, balance_after, reference_type, idempotency_key, description,
        prev_hash, entry_hash
    ) VALUES (
        v_wallet_tx_id, v_wallet_id, p_user_id, v_last_sequence + 1, 'GACHA_PULL', 'DEBIT', v_event_cost,
        v_balance, v_new_balance, 'PULL', p_idempotency_key, 'Gacha pull ' || v_event_name,
        v_last_hash, gen_random_uuid()::varchar
    );

    UPDATE wallet.wallets
    SET balance = v_new_balance,
        last_ledger_sequence = v_last_sequence + 1,
        last_ledger_hash = v_wallet_tx_id::varchar,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    INSERT INTO gacha.pulls (
        id, user_id, event_id, item_id, coin_cost, roll_value, wallet_transaction_id,
        idempotency_key, ip_address, user_agent, created_at
    ) VALUES (
        v_pull_id, p_user_id, p_event_id, v_selected_item_id, v_event_cost, v_random_roll, v_wallet_tx_id,
        p_idempotency_key, p_ip_address, p_user_agent, NOW()
    );

    INSERT INTO gacha.user_items (
        id, user_id, item_id, source_pull_id, status, created_at, updated_at
    ) VALUES (
        v_user_item_id, p_user_id, v_selected_item_id, v_pull_id, 'active', NOW(), NOW()
    );

    RETURN QUERY SELECT 
        v_pull_id AS pull_id, 
        v_selected_item_id AS item_id, 
        v_selected_item_name AS item_name, 
        v_new_balance AS new_balance;

END;
$$ LANGUAGE plpgsql;
