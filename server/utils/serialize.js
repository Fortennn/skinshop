/**
 * Strip server-only fields before sending a user object to the client.
 */
export function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    picture: row.picture,
    balance: Number(row.balance ?? 0),
    provider: row.provider,
    steamTradeUrl: row.steam_trade_url ?? null,
    memberSince: row.created_at,
  };
}

export function serializeSkin(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    wear: s.wear,
    price: Number(s.price),
    rarity: s.rarity,
    collection: s.collection,
    image: s.image,
  };
}

export function serializeInventoryItem(row) {
  return {
    purchaseId: row.id,
    id: row.skin_id,
    name: row.name,
    type: row.type,
    wear: row.wear,
    price: Number(row.price),
    rarity: row.rarity,
    collection: row.collection,
    image: row.image,
    acquiredAt: row.acquired_at,
    source: row.source,
  };
}

export function serializeHistoryRow(row) {
  // Frontend expects amount as a signed string with sign (legacy contract).
  const amt = Number(row.amount ?? 0);
  let amountStr;
  if (row.type === 'Purchase' || row.type === 'Upgrade Loss') {
    amountStr = `-${Math.abs(amt).toFixed(2)}`;
  } else if (row.type === 'Sale' || row.type === 'Top Up' || row.type === 'Upgrade Win') {
    amountStr = `+${Math.abs(amt).toFixed(2)}`;
  } else {
    amountStr = amt.toFixed(2);
  }
  return {
    id: row.id,
    type: row.type,
    item: row.item_name,
    date: (row.created_at || '').split(' ')[0] || '',
    amount: amountStr,
  };
}
